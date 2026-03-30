package com.group.blog.repository;

import com.group.blog.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    // 🔥 CÂU LỆNH TỐI ƯU CHUẨN 3NF (Giải quyết N+1 Query)
    // Dùng Subquery để đếm số lượng ngay trong lúc lấy Blog
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b " +
            "ORDER BY b.createdAt DESC")
    List<Object[]> findAllBlogsWithCounts();

    // Lấy bài viết theo Category ID (Kèm đếm view, like, comment chuẩn 3NF)
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b WHERE b.category.id = :categoryId")
    List<Object[]> findBlogsByCategoryIdWithCounts(@Param("categoryId") UUID categoryId);

    //  lọc theo Tag
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b JOIN b.tags t WHERE t.id = :tagId")
    List<Object[]> findBlogsByTagIdWithCounts(@Param("tagId") UUID tagId);

    // Tìm kiếm bài viết theo tiêu đề
    @Query("SELECT b, " +
            "(SELECT COUNT(v) FROM BlogView v WHERE v.blog = b), " +
            "(SELECT COUNT(l) FROM BlogLike l WHERE l.blog = b), " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.blog = b) " +
            "FROM Blog b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Object[]> searchBlogsByKeywordWithCounts(@Param("keyword") String keyword);

    // Chỉ lấy 5 bài viết khớp tiêu đề, không cần JOIN đếm view cho nhẹ
    List<Blog> findTop5ByTitleContainingIgnoreCase(String title);
}