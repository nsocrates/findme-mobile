# findme

## Notes

- Be sure to remove Push Notifications from xcode under "Signing & Capabilities"

## Developing

```bash
npx expo prebuild [--clean]
npx expo run:ios [--device]
```

## Installing on device

1. Build (Command+B) from Xcode by setting proper code signing identities
2. From Xcode's file search at left bottom, search for .app (This will be under product directory)
3. Right Click on this .app file and select Show in Finder
4. Create directory and name it as Payload, copy .app into Payload directory
5. Archive/Compress(.zip) Payload directory, rename file extension from .zip to .ipa
6. Connect device to your Mac -> Window -> Devices and Simulators -> Under "Installed Apps", click on "+" -> Select .ipa file
