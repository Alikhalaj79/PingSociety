/**
 * Translates OTP error messages from English (or other languages) to Persian
 * This ensures users always see error messages in Persian
 */
export function translateOtpError(errorMessage: string | undefined | null): string {
  if (!errorMessage) {
    return "خطا در تایید کد";
  }

  const error = errorMessage.toLowerCase().trim();

  // Common OTP error patterns
  const errorMap: Record<string, string> = {
    // Invalid/Wrong OTP
    "invalid otp": "کد تایید نامعتبر است",
    "otp is invalid": "کد تایید نامعتبر است",
    "invalid code": "کد تایید نامعتبر است",
    "code is invalid": "کد تایید نامعتبر است",
    "wrong otp": "کد تایید اشتباه است",
    "wrong code": "کد تایید اشتباه است",
    "incorrect otp": "کد تایید اشتباه است",
    "incorrect code": "کد تایید اشتباه است",
    "otp mismatch": "کد تایید اشتباه است",
    "code mismatch": "کد تایید اشتباه است",

    // Expired OTP
    "otp expired": "کد تایید منقضی شده است",
    "code expired": "کد تایید منقضی شده است",
    "expired otp": "کد تایید منقضی شده است",
    "expired code": "کد تایید منقضی شده است",
    "otp has expired": "کد تایید منقضی شده است",
    "code has expired": "کد تایید منقضی شده است",

    // Not found
    "otp not found": "کد تایید یافت نشد",
    "code not found": "کد تایید یافت نشد",
    "otp does not exist": "کد تایید یافت نشد",
    "code does not exist": "کد تایید یافت نشد",

    // Already used
    "otp already used": "این کد تایید قبلاً استفاده شده است",
    "code already used": "این کد تایید قبلاً استفاده شده است",
    "otp has been used": "این کد تایید قبلاً استفاده شده است",
    "code has been used": "این کد تایید قبلاً استفاده شده است",

    // Too many attempts
    "too many attempts": "تعداد تلاش‌های مجاز تمام شده است",
    "maximum attempts exceeded": "تعداد تلاش‌های مجاز تمام شده است",
    "too many tries": "تعداد تلاش‌های مجاز تمام شده است",
    "max attempts reached": "تعداد تلاش‌های مجاز تمام شده است",
    "rate limit exceeded": "تعداد تلاش‌های مجاز تمام شده است",

    // Send OTP errors
    "failed to send otp": "خطا در ارسال کد تایید",
    "failed to send code": "خطا در ارسال کد تایید",
    "could not send otp": "خطا در ارسال کد تایید",
    "could not send code": "خطا در ارسال کد تایید",
    "unable to send otp": "خطا در ارسال کد تایید",
    "unable to send code": "خطا در ارسال کد تایید",
    "sms sending failed": "خطا در ارسال پیامک",
    "sms failed": "خطا در ارسال پیامک",

    // Phone number errors
    "invalid phone": "شماره موبایل نامعتبر است",
    "invalid phone number": "شماره موبایل نامعتبر است",
    "phone number is invalid": "شماره موبایل نامعتبر است",
    "phone not found": "شماره موبایل یافت نشد",
    "phone number not found": "شماره موبایل یافت نشد",

    // Generic errors
    "verification failed": "تایید کد ناموفق بود",
    "verification error": "خطا در تایید کد",
    "authentication failed": "احراز هویت ناموفق بود",
    "authentication error": "خطا در احراز هویت",
    "server error": "خطا در ارتباط با سرور",
    "internal server error": "خطا در ارتباط با سرور",
    "network error": "خطا در ارتباط با سرور",
    "connection error": "خطا در ارتباط با سرور",
  };

  // Check for exact matches first
  if (errorMap[error]) {
    return errorMap[error];
  }

  // Check for partial matches (contains)
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return value;
    }
  }

  // If no match found, return the original message if it's already in Persian
  // Otherwise return a generic error message
  const persianRegex = /[\u0600-\u06FF]/;
  if (persianRegex.test(errorMessage)) {
    return errorMessage;
  }

  // Default fallback
  return "کد تایید نامعتبر است";
}

