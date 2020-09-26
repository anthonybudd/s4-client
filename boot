#!/bin/sh

echo '   _____ __ __     _________            __ '
echo '  / ___// // /    / ____/ (_)__  ____  / /_'
echo '  \__ \/ // /_   / /   / / / _ \/ __ \/ __/'
echo ' ___/ /__  __/  / /___/ / /  __/ / / / /_  '
echo '/____/  /_/     \____/_/_/\___/_/ /_/\__/  '
echo ''
echo ''                                        

echo '* Initializing local clock'
ntpdate -B -q 0.debian.pool.ntp.org
echo '* Starting tor'
tor -f /etc/tor/torrc &
echo '* Starting Proxy'
node /app/src/index.js