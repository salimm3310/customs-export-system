// Universal Tracker Engine - Clean Version
function executeUniversalTrack(bookingNo, carrier) {
    if (!bookingNo) return;
    const carrierName = (carrier || "MAERSK").toUpperCase().trim();
    let trackingUrl = `https://www.maersk.com/tracking/${bookingNo}`;
    
    if (carrierName.includes("MSC")) {
        trackingUrl = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
    }
    
    window.open(trackingUrl, '_blank');
}