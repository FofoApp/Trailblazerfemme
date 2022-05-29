const express = require('express');
const router = express.Router();
const PodcastCategoryController = require('./../controllers/podcastController/PodcastCategoryController');
const PodcastController = require('./../controllers/podcastController/PodcastController');
const PodcastEpisodeController = require('./../controllers/podcastController/podcastEpisodeController');

const { verifyAccessToken } = require('./../helpers/jwtHelper');
const upload = require('./../helpers/multer');



//PODCAST CATEGORY
router.post('/category/create', upload.single('podcastImage'),  PodcastCategoryController.createPodcastCategory);
router.get('/categories', PodcastCategoryController.PodcastCategories);


//PODCAST
router.get('/', PodcastController.podcasts);
router.post('/create', upload.single('podcastImage'), PodcastController.createNewPodcast);
router.get('/lists', PodcastController.listPodcasts);
router.get('/search', PodcastController.searchForPodcast);
router.get('/:podcastId/search', PodcastController.searchPodcastById);
router.delete('/:podcastId/delete', PodcastController.deletePodcastById);


//PODCAST EPISODES
router.post('/episode/create', upload.single('podcastImage'), PodcastEpisodeController.createNewPodcastEpisode);
router.get('/episodes/lists', PodcastEpisodeController.listPodcastEpisodes);
router.get('/episodes/search', PodcastEpisodeController.searchForPodcastEpisode);
router.put('/episodes/update', PodcastEpisodeController.updatePodcastEpisodeById);
router.delete('/episodes/delete', PodcastEpisodeController.deletePodcastEpisodeById);
// router.get('/search', PodcastController.searchForPodcast);
// router.delete('/:podcastId/delete', PodcastController.deletePodcastById);







module.exports = router;