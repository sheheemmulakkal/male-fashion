
module.exports = {

    // Home page GET
    getHome : ( req, res ) => {
        res.render( 'shop/home' )

    },

    // Shop page GET
    getShop : ( req, res ) => {
        res.render('shop/shop')
    }

}