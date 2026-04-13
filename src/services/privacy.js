import asyncHandler from "../middleware/async.js";
import db from "../config/db.js";
import ErrorResponse from "../utlis/ErrorResponse.js";

// Create Terms
const createTerms = asyncHandler(async (body) => {
    const { content, language } = body;
    console.log(body)
    if (!content || !language) {
        throw new ErrorResponse('Content and language are required', 400);
    }

    const newTerms = await db.privacy.create({
        content,
        language
    });
    console.log(newTerms)
    return newTerms;
});

const updateTerms = asyncHandler(async (query,body) => {
    const {content} = body;
    const {language} = query

    if (!language) {
        throw new ErrorResponse('ID is required to update terms', 400);
    }
    const terms = await db.privacy.findOne({where:{language}});

    if (!terms) {
        throw new ErrorResponse('Terms not found', 404);
    }
    terms.content = content || terms.content;
    terms.isGujarati = typeof isGujarati === 'boolean' ? isGujarati : terms.isGujarati;

    await terms.save();

    return terms;
});

/* const deleteTerms = asyncHandler(async (query) => {
    const { id } = query;
    if (!id) {
        throw new ErrorResponse('ID is required to delete terms', 400);
    }
    const terms = await db.privacy.findOne(id);
    if (!terms) {
        throw new ErrorResponse('Terms not found', 404);
    }
    await terms.destroy();

    return { message: 'Terms deleted successfully' };
});
 */
const fetchTerms = asyncHandler(async()=>{
    const terms = await db.privacy.findAll();
    return terms
})

const fetchTermsById = asyncHandler(async(query)=>{
    const {language} = query;
    console.log(query)
    if(!language ){
        throw new ErrorResponse("Id is required",400);
    }
    const terms = await db.privacy.findOne({where:{language}})
    console.log(terms)
    return terms 
})

export default {
    fetchTerms,
    fetchTermsById,
    createTerms,
    updateTerms,
/*     deleteTerms */
};;
