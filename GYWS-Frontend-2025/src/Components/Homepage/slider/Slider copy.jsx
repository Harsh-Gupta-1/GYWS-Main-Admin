import './Slider.css';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import carouselData from "./carouselData";

function Slider() {


  return (
    <>
      <div>
        <Carousel
          showArrows={true}
          showStatus={false}
          showThumbs={false}
          showIndicators={false}
          // timeInterval={5000}
          autoPlay={true}
          interval={4000}
          infiniteLoop={true}
          stopOnHover={true}
          animationHandler={'fade'}
          preventMovementUntilSwipeScrollTolerance={true}
        >
          {
            carouselData.map((item, index) => {
              return (
                <div key={index} className='home-carousel-item'>
                  <div className="home-carousel-item-image">
                    <img src={item.img} alt={item.alt} className='carousel_image' />
                  </div>
                  {/* <p className="legend hide_slider">{item.legend}</p> */}
                </div>
              )
            })
          }
        </Carousel>

      </div>

    </>
  )
}

export default Slider