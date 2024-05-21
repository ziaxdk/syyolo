# Mikrotik hap ac lite - SY YOLO

## Find channel for iPhone hotspot (phone unlocked and go in settings / share internet)
```
/interface/wireless/scan wlan1
```
-> AP 9E:5C:81:D1:20:C8  ZiaxDK               2437/20/gn(18dBm)     -47  -117   70

## LAN
```
/interface/bridge/add name=brLAN comment="Br LAN"
/interface/bridge/port add interface=ether2 bridge=brLAN
/interface/bridge/port add interface=ether3 bridge=brLAN
/interface/bridge/port add interface=ether4 bridge=brLAN
/interface/bridge/port add interface=wlan1 bridge=brLAN
/interface/bridge/port add interface=wlan2 bridge=brLAN
```

## DHCP Server
```
/ip/address/add address=10.10.10.1/24 interface=brLAN 
/ip/pool/add name=LAN ranges=10.10.10.40-10.10.10.254
/ip/dhcp-server/network/add address=10.10.10.0/24 gateway=10.10.10.1 dns-server=8.8.8.8
/ip/dhcp-server/add interface=brLAN address-pool=LAN
```


## Wifi 5ghz
```
/interface/wireless/security-profiles/add name=YOLO-AP mode=dynamic-keys authentication-types=wpa2-psk wpa2-pre-shared-key=[key]
/interface/wireless/set wlan2 security-profile=YOLO-AP ssid=YOLO mode=ap-bridge
/interface/wireless/enable wlan2
```

## Wifi 2,4ghz
```
/interface/wireless/set wlan1 security-profile=YOLO-AP ssid=YOLO mode=ap-bridge band=2ghz-onlyn frequency=2437 channel-width=20mhz
/interface/wireless/enable wlan1
```

## WAN / Connect to iPhone
```
/interface/wireless/security-profiles/add name=ZiaxDK mode=dynamic-keys authentication-types=wpa2-psk wpa2-pre-shared-key=[key]
/interface/wireless/add name=ToInternet master-interface=wlan1 mode=station security-profile=ZiaxDK ssid=ZiaxDK
/interface/bridge/add name=brWAN comment="Br WAN"
/ip/dhcp-client/add interface=brWAN
/interface/bridge/port add interface=ToInternet bridge=brWAN
/ip/firewall/nat/add chain=srcnat out-interface=brWAN action=masquerade
/interface/wireless/enable ToInternet
```
