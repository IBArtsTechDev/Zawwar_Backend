import db from "../../config/db.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";

const createBadge = asyncHandler(async (body, file) => {
    const { name,description,pointsRequires } = body;
    const existing_badge = await db.badges.findOne({ where: { name } });
    if (existing_badge) {
        throw new ErrorResponse("Badge with the same name already exists");
    }
    const image = file;
    const data = {
        name:name,
        description:description,
        icon: image ? image.filename : null,
        pointsRequires:pointsRequires
    }
    const badge = await db.badges.create(data);
    return badge;
});

const updateBadge = asyncHandler(async (query, body, file) => {
    const { badgeId } = query;
    const existing_badge = await db.badges.findOne({ where: { badgeId } });
    if (!existing_badge) {
        throw new ErrorResponse("Badge does not exist", 404);
    }
    const data = {
        name: body.name || existing_badge.name,
        description: body.description || existing_badge.description,
        icon: body.icon || existing_badge.icon,
        pointsRequires: body.pointsRequires || existing_badge.pointsRequires
    };
    const badge = await existing_badge.update(data);
    return badge;
});

const deleteBadge = asyncHandler(async (query) => {
    const { badgeId } = query;
    const existing_badge = await db.badges.findOne({ where: { badgeId } });
    if (!existing_badge) {
        throw new ErrorResponse("Badge does not exist", 404);
    }
    await existing_badge.destroy();
    return { message: "Badge deleted successfully" };
});

const fetchBadges = asyncHandler(async () => {
    const badges = await db.badges.findAll();
    return badges;
});
const fetchBadgesByUser = asyncHandler(async (query) => {
    const { userId } = query;
    const user = await db.user.findOne({ where: { userId } });
    if (!user) {
        throw new ErrorResponse("User does not exist", 404);
    }
    const userBadges = user.badges || [];
    const badges = await db.badges.findAll({
        where: {
            badgeId: {
                [Sequelize.Op.in]: userBadges.map(badge => badge.badgeId)
            }
        }
    });
    return badges;
});

export default {
    createBadge,
    updateBadge,
    deleteBadge,
    fetchBadges,
    fetchBadgesByUser
};;

