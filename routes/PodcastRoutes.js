const express = require('express');
const router = express.Router();

const PodcastCategoryController = require('./../controllers/podcastController/PodcastCategoryController');
const PodcastController = require('./../controllers/podcastController/PodcastController');
const PodcastEpisodeController = require('./../controllers/podcastController/podcastEpisodeController');

const { verifyAccessToken } = require('./../helpers/jwtHelper');
const { permissions } = require('./../middlewares/permissionsMiddleware');

const upload = require('./../helpers/multer');


//PODCAST CATEGORY
router.post('/category/create', verifyAccessToken, permissions(["admin"]), PodcastCategoryController.createPodcastCategory);
router.patch('/category/:podcastCateogryId/update', verifyAccessToken, permissions(["admin"]),  PodcastCategoryController.updatePodcastCategoryById);
router.delete('/category/:podcastCateogryId/delete', verifyAccessToken, permissions(["admin"]),  PodcastCategoryController.deletePodcastCategoryById);
router.get('/categories', verifyAccessToken,  PodcastCategoryController.PodcastCategories);


//PODCAST
router.get('/', PodcastController.podcasts);
router.post('/create', verifyAccessToken, permissions(["admin"]), upload.single('podcastImage'), PodcastController.createNewPodcast);
router.get('/lists', verifyAccessToken, PodcastController.listPodcasts);
router.get('/search', verifyAccessToken, PodcastController.searchForPodcast);
router.get('/:podcastId/search', PodcastController.searchPodcastById);
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