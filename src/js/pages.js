// Botões de página
const trainingBtn = document.querySelector(".training-btn");
const inicialPage = document.querySelector(".logo-principal");
// Sections
const sectionTextpresentation = document.querySelector(".text-presentation"); 
const sectionWebsitePresentation = document.querySelector(".website-presentation"); 
const sectionMyWorkouts = document.querySelector(".my-workouts-section"); 


trainingBtn.addEventListener("click", () => {
    sectionTextpresentation.classList.add("clear");
    sectionWebsitePresentation.classList.add("clear");
})

// Geral
inicialPage.addEventListener("click", () => {
  sectionTextpresentation.classList.remove("clear");
  sectionWebsitePresentation.classList.remove("clear");
  sectionMyWorkouts.classList.remove("clear");
});