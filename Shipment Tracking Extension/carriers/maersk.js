// Maersk Direct Support Engine
function trackMaerskShipment(bookingNo) {
    if (!bookingNo) return;
    const url = `https://www.maersk.com/tracking/${bookingNo}`;
    window.open(url, '_blank');
}