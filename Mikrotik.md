# Connect to ZiaxDK iPhone
/ip/dhcp-client/add interface=wlan1
/interface/wireless/security-profiles/add name=ZiaxDK mode=dynamic-keys authentication-types=wpa2-psk wpa2-pre-shared-key=[KEY]
/interface/wireless/set wlan1 security-profile=ZiaxDK ssid=ZiaxDK
/interface/wireless/enable wlan1

# LAN
/interface/bridge/add name=brLAN comment="Br LAN"
/interface/bridge/port add interface=ether2 bridge=brLAN
/interface/bridge/port add interface=ether3 bridge=brLAN
/interface/bridge/port add interface=ether4 bridge=brLAN
# Disconnecting....

# DHCP Server
/ip/address/add address=10.10.10.1/24 interface=brLAN 
/ip/pool/add name=LAN ranges=10.10.10.40-10.10.10.254
/ip/dhcp-server/network/add address=10.10.10.0/24 gateway=10.10.10.1 dns-server=8.8.8.8
/ip/dhcp-server/add interface=brLAN address-pool=LAN
/ip/firewall/nat/add chain=srcnat out-interface=wlan1 action=masquerade

# Wifi 5ghz
/interface/wireless/security-profiles/add name=YOLO-AP mode=dynamic-keys authentication-types=wpa2-psk wpa2-pre-shared-key=[KEY]
/interface/wireless/set wlan2 security-profile=YOLO-AP ssid=YOLO mode=ap-bridge
/interface/bridge/port add interface=wlan2 bridge=brLAN
/interface/wireless/enable wlan2

# Wifi 2,4ghz
/interface/wireless/add name=wifi24 master-interface=wlan1 mode=ap-bridge ssid=YOLO security-profile=YOLO-AP
/interface/bridge/port add interface=wifi24 bridge=brLAN
/interface/wireless/enable wifi24
