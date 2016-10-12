#!/bin/bash
cd "$( dirname $0)";
rm -r mavo && cp -Rf ../mavo/dist mavo
