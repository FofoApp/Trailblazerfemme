const express = require('express');
const router = express.Router();

const PodcastCategoryController = require('./../controllers/podcastController/PodcastCategoryController');
const PodcastController = require('./../controllers/podcastController/PodcastController');
const PodcastEpisodeController = require('./../controllers/podcastController/podcastEpisodeController');

const { verifyAccessToken } = require('./../helpers/jwtHelper');
const { permissions } = require('./../middlewares/permissionsMiddleware');

const upload = require('./../helpers/multer');


router.post("/files", upload.array("avatar", 2), (req, res) => {

    console.log({ images: req.files })

    try {


        return res.json({ message: "Successfully uploaded files", avatars: req.files  });

    } catch (error) {
        console.log(error)
        return res.json({ error: error });
    }

    // if (res.status(200)) {
    //     console.log("Your file has been uploaded successfully.");
    //     console.log(req.files);
    //     res.json({ message: "Successfully uploaded files" });
    //     res.end();
    // }
});


//PODCAST CATEGORY
router.post('/category/create', verifyAccessToken, permissions(["admin"]), PodcastCategoryController.createPodcastCategory);
router.patch('/category/:podcastCateogryId/update', verifyAccessToken, permissions(["admin"]),  PodcastCategoryController.updatePodcastCategoryById);
router.delete('/category/:podcastCateogryId/delete', verifyAccessToken, permissions(["admin"]),  PodcastCategoryController.deletePodcastCategoryById);
router.get('/categories', verifyAccessToken,  PodcastCategoryController.PodcastCategories);

const upload_data = [
    {name: 'podcastImage', maxCount: 1 },
    {name: 'hostImage', maxCount: 1},
]


//PODCAST
router.get('/', verifyAccessToken, PodcastController.podcasts);
router.post('/create', verifyAccessToken, permissions(["admin"]), upload.fields(upload_data), PodcastController.createNewPodcast);
router.get('/lists', verifyAccessToken, PodcastController.listPodcasts);
router.get('/search', verifyAccessToken, PodcastController.searchForPodcast);
router.get('/:podcastId/search', verifyAccessToken, PodcastController.searchPodcastById);
router.patch('/:podcastId/update', verifyAccessToken, permissions(["admin"]), PodcastController.updatePodcastById);
router.delete('/:podcastId/delete', verifyAccessToken, permissions(["admin"]), PodcastController.deletePodcastById);


//PODCAST EPISODES
router.post('/episode/create', verifyAccessToken, permissions(["admin"]), upload.single('podcastImage'), PodcastEpisodeController.createNewPodcastEpisode);
router.get('/episodes/lists', verifyAccessToken,  PodcastEpisodeController.listPodcastEpisodes);
router.get('/episodes/search', verifyAccessToken, PodcastEpisodeController.searchForPodcastEpisode);
router.patch('/episodes/update', verifyAccessToken, permissions(["admin"]), PodcastEpisodeController.updatePodcastEpisodeById);
router.delete('/episodes/delete', verifyAccessToken, permissions(["admin"]), PodcastEpisodeController.deletePodcastEpisodeById);
// router.get('/search', PodcastController.searchForPodcast);
// router.delete('/:podcastId/delete', PodcastController.deletePodcastById);







module.exports = router;