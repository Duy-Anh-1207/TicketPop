<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nguoi_dung', function (Blueprint $table) {
            // nếu bảng đã có cột rồi thì bỏ đi
            $table->timestamp('email_verified_at')->nullable()->after('email');
            $table->string('email_verify_token', 64)->nullable()->after('email_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('nguoi_dung', function (Blueprint $table) {
            $table->dropColumn(['email_verified_at', 'email_verify_token']);
        });
    }
};
