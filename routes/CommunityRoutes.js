const router = require('express').Router();

const CommunityControllers = require('../controllers/CommunityControllers');


router.get('/lists', CommunityControllers.listAllCommunities);
router.patch('/:communityId/join', CommunityControllers.joinCommunity);

router.post('/create', CommunityControllers.createNewCommunity);

router.get('/:communityId/get', CommunityControllers.getCommunityById);

router.get('/search', CommunityControllers.searchCommunityByParams);

router.patch('/:communityId/update', CommunityControllers.updateCommunityById);

router.delete('/:communityId/delete', CommunityControllers.deleteCommunityById);


module.exports = router;