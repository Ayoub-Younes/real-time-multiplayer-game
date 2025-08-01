const path = '/public/imgs/'
const simpleSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
  <circle cx="25" cy="25" r="20" fill="blue" />
</svg>`;
const encoded = encodeURIComponent(simpleSVG);
const dataUrl = `data:image/svg+xml;charset=utf8,${encoded}`;
const pokemons = [

    //{id:1, url:`${path}pika.webp`},
    { id: 1, url: dataUrl }, // this is your inline SVG
    {id:2, url:`${path}charmandar.webp`},
    {id:3, url:`${path}bulbasaur.webp`},
    {id:4, url:`${path}squierl.webp`},
]
const pokeballs =[
    {id:1, url:`${path}pokeball1.webp`, value:1},
    {id:2, url:`${path}pokeball2.webp`, value:2}
]
const loadImages = () => {
    return new Promise((resolve, reject) => {
        let loadedImages = 0;
        let totalImages = pokemons.length + pokeballs.length;

        [...pokemons,...pokeballs].forEach(pok => {
            const img = new Image();
            img.src = pok.url;
            img.onload = () => {
                pok.img = img;
                loadedImages++;
                if (loadedImages === totalImages) {
                    resolve();
                }
            };
            img.onerror = reject;
        });
    });
};

export { pokemons, pokeballs,loadImages };