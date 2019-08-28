#!/usr/bin/python
# Interprets the log output of OpenFoam 6 and predicts the time remaining to finish a transient simulation.
# foamTime.py v1.0 written for OpenFoam6 in July 2019.
# If you find this software useful enough to keep using it, you may like to donate AU$8 to me at "paypal.me/amcrae78".
# Initially distributed at www.cfd-online.com/Forums/openfoam-community-contributions/ (as user AndrewM4000).

import sys
import re
from datetime import datetime, timedelta

# You could change this if you want a different windowing size.
nSamples = 20       # number of single timestep computation rates to be averaged when making an estimate.

if len(sys.argv)<=1 or sys.argv[1]=="--help" :
    sys.stderr.write("Interprets the text output of rhoPimpleFoam in OpenFoam 6 and predicts the computing time remaining.\n")
    sys.stderr.write("The transient solver log output must be sent to this script through the standard input stream.\n")
    sys.stderr.write("The output is same as input but with time remaining estimates injected into it after each Time value.\n")
    sys.stderr.write("A target simulation endTime is required as the 1st command line argument.\n")
    sys.stderr.write("Command parameters:	foamTime.py <endTime> [-filter] [-singleServe]\n")
    sys.stderr.write("e.g. :      tail -f ~foamer/case/log.mpirun | foamTime.py 4.50\n")
    sys.stderr.write("An optional argument of '-filter' will output only the simTime and the estimates.\n")
    sys.stderr.write("An optional argument of '-singleServe' will exit after the first estimate is calculated.\n");
    sys.exit(1)

simTime = 0.0;
initialTime = 0.0;
clockTime = 0;
initialClock = 0;
initTimestamp = 0;
initialised = False;
dataRequired = 2;
rateSamples = []

injectionMode = True;
singleServe = False;
passedTarget=False

for ai in range(len(sys.argv)) :
    if ai==1:
        endTime = float(sys.argv[1])
    elif sys.argv[ai]=="-filter" :
        injectionMode = False
    elif sys.argv[ai]=="-singleServe" :
        singleServe = True

sys.stdout.write("* Estimating time remaining until OpenFOAM timestep reaches {}.\n".format(endTime) );

with sys.stdin as logstream:
    for line in logstream:
        if injectionMode:
            sys.stdout.write(line);

        m = re.search("^Time = ([0-9.]+)", line)
        if dataRequired==2 and m:   # contains "Time = n.nnnn"
            # sys.stdout.write("* simTime updated");
            simTime = float(m.group(1))   # record this as new simTime.
            if not injectionMode:
                sys.stdout.write("simTime={}\n".format(m.group(1)));
            if not initialised:
                initialTime = simTime
            dataRequired -= 1

        m = re.search("ClockTime = ([0-9]+) s", line)
        if  dataRequired==1 and m: # contains "Time = 0.3496"
            # sys.stdout.write("* clockTime updated");
            clockTime = int(m.group(1))   # record this as new simTime.
            if not initialised:
                initialClock = clockTime
                initTimestamp =  datetime.today()
                if simTime>0.0 and clockTime>0:
                    initialised = True;
                    dataRequired = 2
                    # sys.stdout.write("* Estimator initialised starting from clockTime {}.".format(clockTime));
            else:
                dataRequired -= 1

	if initialised and simTime > endTime and not passedTarget:
		sys.stdout.write( datetime.today().strftime(
		  "* Passed target endTime at %Y-%m-%d, %I:%M%p, no more estimates.\n"
		) );
		passedTarget=True;

        if initialised and dataRequired==0 and not passedTarget:
            # a new pair of clockTime and simTime is now needed.
            dataRequired = 2
            # when both variables have been updated, use them to recompute estimated remaining time.
            if simTime<=initialTime: continue; #skip this record if some timecode from the past is encountered.
	    if clockTime-initialClock<1.0: continue; #skip this record if less than 1 second has elapsed since the start
            latestRate = (clockTime-initialClock) / (simTime-initialTime)  # real seconds per virtual second
            rateSamples.append(latestRate)
            if len(rateSamples)>nSamples: del rateSamples[0]
            # sys.stdout.write("* At clock={} the last {} sim rates: {} \n".format(clockTime, nSamples, rateSamples));

            if len(rateSamples) >= nSamples:
                # Compute the harmonic mean, which is more appropriate for rates of change than the arithmetic mean.
                averageRate = 0.0
                for r in rateSamples:
                    averageRate += 1.0/r
                averageRate = len(rateSamples) / averageRate
                remaining = (endTime-simTime) * averageRate
                if remaining/3600.0 > 1.5:
                    remHuman = "{:.2f} hours".format(remaining/3600.0)
                elif remaining > 99:
                    remHuman = "{:.1f} minutes".format(remaining/60.0);
                else:
                    remHuman ="{:d} seconds!".format( int(round(remaining)) );

                # The time elapsed since program start has to be added to the program start timestamp to get now().
                # This gives more consistent results than calling today() repeatedly when the input is buffered
                # and several timestep logs can all arrive only a fraction of realtime apart.
                delta = timedelta(seconds=(clockTime-initialClock)+remaining)
                eta = initTimestamp + delta

                # And inject the estimates into stdout.
                sys.stdout.write( \
                  "* Estimated time remaining: "+remHuman+ " \t" \
                  + eta.strftime("* ETA approximately %Y-%m-%d, %I:%M%p.\n") \
                );

                if singleServe: 
                    break;

            #end calculation case

        sys.stdout.flush()
        # line loop continues

sys.stdout.flush()
sys.stdout.close()
