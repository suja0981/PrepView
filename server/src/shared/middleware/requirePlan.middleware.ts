import { Request, Response, NextFunction } from "express";
import { User } from "../../modules/user/user.model";

/**
 * Middleware that checks the user's plan before allowing access to a route.
 *
 * Usage:
 *   router.post("/interviews", authenticate, requirePlan("premium"), createInterview);
 *
 * Returns 403 with { upgradeRequired: true } if the plan requirement isn't met.
 * The frontend listens for this flag and redirects to /pricing.
 */
export function requirePlan(required: "premium") {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user!.userId).select("plan");
      if (!user || user.plan !== required) {
        return res.status(403).json({
          success: false,
          upgradeRequired: true,
          message: "This feature requires a Premium plan. Upgrade to continue.",
        });
      }
      next();
    } catch {
      next();
    }
  };
}
