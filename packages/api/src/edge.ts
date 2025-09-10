import { authRouter } from "./router/auth";
import { categoryRouter } from "./router/category";
import { customerRouter } from "./router/customer";
import { gameRouter } from "./router/game";
import { helloRouter } from "./router/health_check";
import { k8sRouter } from "./router/k8s";
import { stripeRouter } from "./router/stripe";
import { tagRouter } from "./router/tag";
import { searchRouter } from "./router/search";
import { ratingCommentRouter } from "./router/rating-comment";
import { favoriteRouter } from "./router/favorite";
import { rankingRouter } from "./router/ranking";
import { uploadRouter } from "./router/upload";
import { createTRPCRouter } from "./trpc";

export const edgeRouter = createTRPCRouter({
  stripe: stripeRouter,
  hello: helloRouter,
  k8s: k8sRouter,
  auth: authRouter,
  customer: customerRouter,
  game: gameRouter,
  category: categoryRouter,
  tag: tagRouter,
  search: searchRouter,
  ratingComment: ratingCommentRouter,
  favorite: favoriteRouter,
  ranking: rankingRouter,
  upload: uploadRouter,
});
