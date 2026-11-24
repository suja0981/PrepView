import { describe, it, expect, vi, beforeEach } from "vitest";
import { paymentService } from "../payment.service";
import { User } from "../../user/user.model";
import { PaymentLog } from "../payment.model";
import { AppError } from "../../../shared/errors/app-error";

// Mock User and PaymentLog
vi.mock("../../user/user.model", () => ({
  User: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../payment.model", () => ({
  PaymentLog: {
    create: vi.fn(),
    exists: vi.fn().mockResolvedValue(null),
  },
}));

describe("PaymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCheckoutSession", () => {
    it("should throw AppError 404 if user not found", async () => {
      vi.mocked(User.findById).mockResolvedValue(null);

      await expect(
        paymentService.createCheckoutSession("missing_user", "test@test.com"),
      ).rejects.toThrowError(new AppError("User not found", 404));
    });

    it("should throw AppError 400 if user is already premium", async () => {
      vi.mocked(User.findById).mockResolvedValue({
        id: "user_1",
        plan: "premium",
      } as any);

      await expect(
        paymentService.createCheckoutSession("user_1", "test@test.com"),
      ).rejects.toThrowError(new AppError("You are already on the Premium plan", 400));
    });
  });

  describe("createPortalSession", () => {
    it("should cancel active subscription and downgrade user to free", async () => {
      vi.mocked(User.findById).mockResolvedValue({
        id: "user_1",
        plan: "premium",
        razorpaySubscriptionId: "sub_12345",
      } as any);

      vi.mocked(User.findByIdAndUpdate).mockResolvedValue({} as any);
      vi.mocked(PaymentLog.create).mockResolvedValue({} as any);

      const url = await paymentService.createPortalSession("user_1");
      expect(url).toContain("/pricing?status=cancelled");
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith("user_1", {
        plan: "free",
        razorpaySubscriptionId: null,
        planExpiresAt: null,
      });
      expect(PaymentLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user_1",
          type: "subscription.cancelled",
          status: "success",
        }),
      );
    });

    it("should redirect to /pricing if user is already free", async () => {
      vi.mocked(User.findById).mockResolvedValue({
        id: "user_2",
        plan: "free",
      } as any);

      const url = await paymentService.createPortalSession("user_2");
      expect(url).toContain("/pricing");
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("handleWebhook", () => {
    it("should activate subscription on subscription.activated", async () => {
      vi.mocked(User.findByIdAndUpdate).mockResolvedValue({} as any);
      vi.mocked(PaymentLog.create).mockResolvedValue({} as any);

      const event = {
        event: "subscription.activated",
        created_at: 1700000000,
        payload: {
          subscription: {
            entity: {
              id: "sub_test_123",
              notes: {
                userId: "user_99",
              },
            },
          },
        },
      };

      await paymentService.handleWebhook(event, "sig", Buffer.from(""));

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user_99",
        expect.objectContaining({
          plan: "premium",
          razorpaySubscriptionId: "sub_test_123",
        }),
      );
      expect(PaymentLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user_99",
          type: "subscription.activated",
          status: "success",
        }),
      );
    });

    it("should downgrade to free on subscription.cancelled", async () => {
      vi.mocked(User.findByIdAndUpdate).mockResolvedValue({} as any);
      vi.mocked(PaymentLog.create).mockResolvedValue({} as any);

      const event = {
        event: "subscription.cancelled",
        created_at: 1700000000,
        payload: {
          subscription: {
            entity: {
              id: "sub_test_123",
              notes: {
                userId: "user_99",
              },
            },
          },
        },
      };

      await paymentService.handleWebhook(event, "sig", Buffer.from(""));

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith("user_99", {
        plan: "free",
        razorpaySubscriptionId: null,
        planExpiresAt: null,
      });
      expect(PaymentLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user_99",
          type: "subscription.cancelled",
          status: "success",
        }),
      );
    });

    it("should skip duplicate webhook events via idempotency check", async () => {
      vi.mocked(PaymentLog.exists).mockResolvedValueOnce({ _id: "existing" } as any);

      await paymentService.handleWebhook(
        {
          event: "subscription.charged",
          payload: { subscription: { entity: { id: "sub_dup", notes: { userId: "user_99" } } } },
        },
        "sig",
        Buffer.from(""),
      );

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(PaymentLog.create).not.toHaveBeenCalled();
    });
  });
});
