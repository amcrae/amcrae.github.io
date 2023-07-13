#!/usr/bin/bash
# Microphone Capture Loop.
# Capture output from a microphone one hour at a time in a rolling window which keeps N previous files.
# It's assumed all recordings will have the same sampling rate.

# Example usage for a microphone which outputs 2 channels:
#   export micRL="hw:CARD=Microphone,DEV=0"  # ATR2500x
#   miccaploop.sh RearL $micRL 2
# Example usage for a more typical microphone:
#   export micFL="hw:CARD=ATR4697USB,DEV=0"  # Conf cheapo
#   miccaploop.sh FrontL $micFL 1

SRATE=32000
pair=$1
micLname=$2
micLchans=$3
# (some remains of earlier script which combined L and R mics into one.)
# micRname=$4
# micRchans=$5

# Keeps only a moving window of previous MAXCAP number of recordings (aside from current recording 00).
MAXCAP=12

# For reasons I won't go into, the exact duration of each recording is randomised slightly by +/- 2 minutes.
randomskew=120

# Significant script changes would be needed to create a Windows version.
# set ffbin=D:\ffmpeg\ffmpeg-4.3.1-win32-static\bin\ffmpeg.exe
ffbin=ffmpeg

# echo Pair $pair will be
echo "Mic $micLname will be sending $micLchans channel(s)"
echo $(date --rfc-3339=seconds) "Mic $micLname will be sending $micLchans channel(s)" >>miccaploop_errs.txt

# maybe try once more instead of stopping completely on the first error.
faillimit=1

failcount=0
while [[ $failcount -le $faillimit ]]
do
	echo loop start

	chunk=$(( 3600 + $RANDOM * $randomskew * 2 / 32767 - $randomskew))

	LMAX=$(( $MAXCAP - 1 ))
	rm "${pair}_cap${MAXCAP}.flac"
	PREV=$MAXCAP
	for cn in $(seq -w $LMAX -1 0)
	do
	  mv "${pair}_cap${cn}.flac" "${pair}_cap${PREV}.flac"
	  PREV=$cn
	done

	FGRAPH="[0:a]channelsplit[LL][LR],[LR]anullsink,[1:a]channelsplit[RL][RR],[RL]anullsink,[LL][RR]amerge"
	# echo $FGRAPH

	echo $(date --rfc-3339=seconds) ${pair} starting >>miccaploop_errs.txt

	errfile="${pair}_ffmpeg_err_"$(date --rfc-3339=seconds | sed 's/[: +]/_/g')".txt"
	# echo $(date --rfc-3339=seconds) ${pair} starting >>"$errfile"
	export FFREPORT=file=$errfile:loglevel=8

	"$ffbin" -report -t $chunk -ar $SRATE -f alsa -channels $micLchans -i "$micLname" -y -ar $SRATE -acodec flac -aq 2 -vn "${pair}_cap00.flac"
	errc=$?
	if [[ $errc -eq 0 ]]
	then
	  echo $(date --rfc-3339=seconds) ${pair} ended OK. >>miccaploop_errs.txt
	  rm $errfile
	else
	  failcount=$(($failcount + 1))
	  echo $(date --rfc-3339=seconds) ${pair} error code $errc , stderr in $errfile >>miccaploop_errs.txt
	fi
done

if [[ $failcount -gt $faillimit ]]
then
  echo $(date --rfc-3339=seconds) ${pair} Had too many consecutive ffmpeg failures. Aborting. >>miccaploop_errs.txt
fi

FFREPORT=""
echo $(date --rfc-3339=seconds) ${pair} loop ended. >>miccaploop_errs.txt

