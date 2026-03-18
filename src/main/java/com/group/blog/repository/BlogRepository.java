package com.group.blog.repository;
import com.group.blog.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    // Tìm bài viết để hiển thị trang chi tiết (theo slug)
    Optional<Blog> findBySlug(String slug);

    // Lấy danh sách bài viết đã xuất bản (không phải bản nháp) + Phân trang cho "Load More"
    Page<Blog> findAllByDraftFalseOrderByPublishedAtDesc(Pageable pageable);

    // Tìm kiếm bài viết theo tiêu đề (Search bar trong video)
    Page<Blog> findByTitleContainingAndDraftFalse(String title, Pageable pageable);

    // Lấy các bài viết Trending (Dựa trên số lượt thích)
    Page<Blog> findByDraftFalseOrderByTotalLikesDesc(Pageable pageable);
}