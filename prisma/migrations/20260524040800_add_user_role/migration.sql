ALTER TABLE "users"
ADD COLUMN "role" VARCHAR(20) NOT NULL DEFAULT 'user';

UPDATE "users" AS public_user
SET "role" = COALESCE(auth_user.raw_app_meta_data->>'role', 'user')
FROM auth.users AS auth_user
WHERE public_user.id = auth_user.id;
