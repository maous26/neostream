#!/bin/bash

# Test if URLResolver native module is available

echo "🔍 Testing URLResolver native module..."
echo ""

# Check logcat for module registration
echo "Checking if module is registered:"
adb logcat -d | grep -i "URLResolver" | tail -10

echo ""
echo "Checking React Native module list:"
adb logcat -d | grep -i "createNativeModules" | tail -5

echo ""
echo "Done!"
