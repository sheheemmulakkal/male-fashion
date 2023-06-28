
const { runInNewContext } = require('vm')
const bannerSchema = require( '../models/bannerModel')

module.exports = {

    getBannerManagement : async ( req, res ) => {

        try {
            const banners = await bannerSchema.find()

            res.render( 'admin/banner-management',{
                banners : banners,
                admin : req.session.admin,
                success : req.flash('success')
            })

        } catch(error) {
            console.log(error.message);
        }
        
    },

    getAddBanner : async ( req, res ) => {

        res.render( 'admin/add-banner',{
            admin : req.session.admin,
            success : req.flash('success')
        })
    },

    addingBanner : async( req, res ) => {

        try {

            const banner = new bannerSchema({
                mainHead : req.body.mainHead,
                typeHead : req.body.type,
                description : req.body.description,
                image : req.file.filename
            })
            await banner.save()
            req.flash('success','Banner Added Succussfully...')
            res.redirect( '/admin/banner' )
            
        } catch (error) {
            console.log(error.message);
        }
    },

    getEditBanner : async( req, res ) => {

        try {
            
            const banner = await bannerSchema.findById(req.params.id)
            res.render( 'admin/edit-banner',{
                banner : banner,
                admin : req.session.admin,
                err : req.flash('err'),
                success : req.flash('success')
            } ) 

        } catch (error) {
            console.log(error.message);
        }
    },

    updateBanner : async ( req, res ) => {

        try {

            const updatedBanner = {
                mainHead : req.body.mainHead,
                typeHead : req.body.type,
                description : req.body.description
            }
            if( req.file ){
                console.log(req.file);
                    if(     
                        file.mimetype !== 'image/jpg' &&
                        file.mimetype !== 'image/jpeg' &&
                        file.mimetype !== 'image/png' &&
                        file.mimetype !== 'image/gif'
                        ){
                            req.flash('err','Check the image type')
                            return res.redirect(`/admin/edit-banner/${bannerId}`)
                        }
                updatedBanner.image = req.file.filename
            }
            const result = await bannerSchema.updateOne({ _id : req.body.bannerId},{
                $set :  updatedBanner 
            })
            req.flash('success','Banner Updated')
            res.redirect( '/admin/banner' )

        } catch (error) {
            console.log(error.message);
      }
    },

    deleteBanner : async ( req, res ) => {
        try {

            const deletetBanner = await bannerSchema.updateOne({ _id : req.params.id },{ status : false })
            res.redirect('/admin/banner')
            
        } catch (error) {
            console.log(error.message);
        }
    },

    restoreBanner : async ( req, res ) => {
        try {

            const restoreBanner = await bannerSchema.updateOne({ _id : req.params.id },{ status : true })
            res.redirect('/admin/banner')
            
        } catch (error) {
            console.log(error.message);
        }
    }
}