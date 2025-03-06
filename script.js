const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar && nav) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close && nav) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const websiteURL = "https://yourwebsite.com"; // Replace with your actual website URL

    let qrCode = new QRCode(document.getElementById("qrcode"), {
        text: websiteURL,
        width: 150,
        height: 150
    });
});
