CREATE TYPE "public"."bank" AS ENUM('bca', 'bni', 'bri', 'mandiri');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('superadmin', 'customer', 'vendor');--> statement-breakpoint
CREATE TABLE "goods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_branch_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"quantity" integer NOT NULL,
	"date_in" date NOT NULL,
	"date_out" date NOT NULL,
	"day_total" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"bank" "bank",
	"status" boolean DEFAULT true NOT NULL,
	"total_price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "goods_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "goods_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"price" integer NOT NULL,
	"description" varchar(255),
	CONSTRAINT "goods_category_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"address" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'customer' NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vendor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" varchar(100) NOT NULL,
	"company_address" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_id_unique" UNIQUE("id"),
	CONSTRAINT "vendor_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vendor_branch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"address" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_branch_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_vendor_branch_id_vendor_branch_id_fk" FOREIGN KEY ("vendor_branch_id") REFERENCES "public"."vendor_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_category_id_goods_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."goods_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor" ADD CONSTRAINT "vendor_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_branch" ADD CONSTRAINT "vendor_branch_vendor_id_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor"("id") ON DELETE no action ON UPDATE no action;