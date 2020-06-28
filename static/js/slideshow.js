// (function(window, document) {

function slideShowInit() {

  var index = 0;
  var autoAdvanceInterval = 4000;
  var isActive = true;
  var leftArrow = document.querySelector('.slideshow-arrow-left');
  var rightArrow = document.querySelector('.slideshow-arrow-right');
  var slides = document.querySelectorAll('.slideshow .background-img');
  console.log('egg0?', leftArrow)
  var randomizeFirstSlide = function(){
    var chosen = Math.round(Math.random() * (slides.length - 1));
    if(chosen < slides.length - 1){
      var luckySlide = slides[chosen];
      var clone = luckySlide.cloneNode();
      luckySlide.parentElement.insertBefore(clone, null);
      luckySlide.parentElement.removeChild(luckySlide);
      slides = document.querySelectorAll('.slideshow .background-img');
    }
  };

  var advance = function(toIndex){
    if(toIndex >= slides.length) toIndex = 0;
    if(toIndex < 0) toIndex = slides.length + toIndex;
    if(toIndex > 0){
      for(var s = 0; s < slides.length; s++){
        slides[s].style.opacity = 1;
      }
      for(var x = slides.length - toIndex;  x < slides.length; x++){
        slides[x].style.opacity = 0;
      }
    } else if(toIndex == 0){
      slides[slides.length - 1].style.opacity = 1;
      setTimeout(function(){
        for(var x = slides.length - 2;  x > 0; x--){
          slides[x].style.opacity = 1;
        }
      });
    }
    index = toIndex;
  };

  leftArrow.addEventListener('click', function(e){
    isActive = false;
    advance(index - 1);
  });

  rightArrow.addEventListener('click', function(e){
    isActive = false;
    advance(index + 1);
  });

  var autoAdvance = function(){
    if(isActive){
      advance(index + 1);
      setTimeout(autoAdvance, autoAdvanceInterval);
    }
  };

  randomizeFirstSlide();
  setTimeout(autoAdvance, autoAdvanceInterval);
}

setTimeout(slideShowInit, 500);

// })(window, document);
