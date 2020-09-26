#!/bin/sh

echo '         __ __          ___            __  '
echo '   _____/ // /    _____/ (_)__  ____  / /_'
echo '  / ___/ // /_   / ___/ / / _ \/ __ \/ __/'
echo ' (__  )__  __/  / /__/ / /  __/ / / / /_  '
echo '/____/  /_/     \___/_/_/\___/_/ /_/\__/  '
echo ''
echo ''

echo '* Initializing local clock'
ntpdate -B -q 0.debian.pool.ntp.org
echo '* Starting tor'
tor -f /etc/tor/torrc &
echo '* Starting Proxy'
node /app/src/index.js