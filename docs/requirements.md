**NGL APP [anonymous-messaging-application]**
*send anonymous messages or public messages.
*view profile with related messages.
*handle/manage messages.

-tech stack:
  -express
  -javascript
  -mongodb/mongoose
  -redis [caching]
  -node mailer [email]
  -jwt [authentication]
  -bcrypt [password hashing]
  -oauth2 [google]
  -validation [zod]
  -error handling [AppError]
  -rate limiting
  -load balancer

* OTP [one-time password]
  - delete OTP after 10 min
  - delete OTP after usage
  - storage OTP temporary
      - store database using mongodb -> support TTL [HDD]
      - into cache redis support TTL [RAM]

-features:
 -authentication flow: 
  -register
  -verify email using OTP
  -login
  -reset password
  -send OTP
  -login with google
  -logout

 -message flow:
  -send a message [anonymous - public]
  -view message
  -delete message [soft-delete/archive]

 -user flow [me]:
  -view profile.
  -edit profile.
  -delete profile.

 -guards:
  -authentication [token]


