
const checkbox = document.getElementsByClassName('checkbox')[0]

checkbox.addEventListener('click', (e)=>{
    console.log("ho")
    // e.target
    console.dir(e.target.checked)
})