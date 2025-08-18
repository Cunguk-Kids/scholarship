CREATE TABLE "faucet_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(255) DEFAULT '',
	"ip_address" varchar(45) DEFAULT '',
	"timestamp" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "faucet_data_address_ip_address_unique" UNIQUE("address","ip_address")
);
