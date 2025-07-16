const path = './public/imgs/'
const pokemons =[
    {id:1, url:`${path}pika.webp`},
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