const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');
const slides = document.querySelectorAll(".slide")

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

var counter = 0;

slides.forEach((slide,index)=>{
    slide.style.left = `${index*100}%`
})


const slideImage = () =>{
    slides.forEach((slide)=>{
        slide.style.transform = `translateX(-${counter*100}%)`
    })
}

const goNext = () =>{
    
    if(counter++){
        slideImage()
    }
}
const goprev = () =>{
    if(counter--){
        slideImage()
    }
}

console.log(slides);
