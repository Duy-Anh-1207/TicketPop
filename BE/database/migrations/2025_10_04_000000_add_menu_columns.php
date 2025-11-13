<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu', function (Blueprint $table) {
            if (!Schema::hasColumn('menu', 'icon')) {
                $table->string('icon', 255)->nullable()->after('ten_chuc_nang');
            }
            if (!Schema::hasColumn('menu', 'color')) {
                $table->string('color', 50)->nullable()->after('path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('menu', function (Blueprint $table) {
            if (Schema::hasColumn('menu', 'icon')) {
                $table->dropColumn('icon');
            }
            if (Schema::hasColumn('menu', 'color')) {
                $table->dropColumn('color');
            }
        });
    }
};
