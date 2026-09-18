import { useState } from "react";

import type { GameDetails } from "../../types/game";

interface GameGalleryProps{
    game: GameDetails;
}

function GameGallery({game}:GameGalleryProps){
    const [activeImage, setActiveImage] = useState(0);

    const images = game.screenshots.length ? game.screenshots : [{id:0,image:game.thumbnail}];

    const currentImage = images[activeImage] ?? images[0];

    const nextImage = () => {
        setActiveImage((current)=>(current + 1) % images.length);
    };
    const previousImage = () =>{
        setActiveImage((current)=>(current + 1 - images.length) % images.length);
    };

    return(
        <section className="game-gallery">
            <div className="game-main-inage-wrapper">
                <img className="game-main-image" src = {currentImage.image} alt = {game.title}/>
            </div>
            <div className="gallery-controls">
                <button
                    className="gallery-arrow"
                    onClick={previousImage}
                    aria-label="Попередній скриншот"> ‹</button>

                <div className="gallery-thumbnail">
                    {images.slice(0,6).map((screenshot,index)=> (
                        <button 
                            key={screenshot.id}
                            className={`gallery-thumbnail ${index===activeImage? "active" : ""}`}
                            onClick={()=>setActiveImage(index)}>
                                    <img src = {screenshot.image} alt = {`${game.title} screenshot ${index+1}`}>
                                    </img>
                            </button>
                    ))}
                </div>
                <button className="gallery-arrow"
                    onClick={nextImage}
                    aria-label = "Наступний скриншот"> ›</button>
            </div>
            <div className="gallery-progress">
                <span style={{width: `${((activeImage + 1)/images.length)}*100%`,
                }}
                />
            </div>
        </section>
    )
}

export default GameGallery