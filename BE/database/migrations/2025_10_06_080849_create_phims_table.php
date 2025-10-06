<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('phims', function (Blueprint $table) {
            $table->id();
            $table->string('ten_phim');
            $table->text('mo_ta')->nullable();
            $table->integer('thoi_luong')->nullable();        
            $table->string('trailer')->nullable();
            $table->string('ngon_ngu')->nullable();
            $table->string('quoc_gia')->nullable();
            $table->string('anh_poster')->nullable();
            $table->date('ngay_cong_chieu')->nullable();
            $table->date('ngay_ket_thuc')->nullable();
            $table->string('do_tuoi_gioi_han')->nullable();
            $table->string('loai_suat_chieu')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('phims');
    }
};
