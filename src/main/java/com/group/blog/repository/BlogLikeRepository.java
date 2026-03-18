package com.group.blog.repository;


import com.group.blog.entity.BlogLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
    public interface BlogLikeRepository extends JpaRepository<BlogLike, UUID> {

        // Kiểm tra xem User này đã like bài này chưa
        boolean existsByUserIdAndBlogId(UUID userId, UUID blogId);

        // Tìm record like cụ thể để xóa (khi người dùng bấm Unlike)
        void deleteByUserIdAndBlogId(UUID userId, UUID blogId);
    }

