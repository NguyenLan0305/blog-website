package com.group.blog.service;

import com.group.blog.dto.request.BlogCreationRequest;
import com.group.blog.dto.request.BlogUpdateRequest;
import com.group.blog.dto.response.BlogResponse;
import com.group.blog.dto.response.BlogSuggestionResponse;
import com.group.blog.entity.*;
import com.group.blog.exception.AppException;
import com.group.blog.exception.ErrorCode;
import com.group.blog.mapper.BlogMapper;
import com.group.blog.repository.*;
import com.group.blog.util.SlugUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogService {

    BlogRepository blogRepository;
    UserRepository userRepository;
    CategoryRepository categoryRepository;
    TagRepository tagRepository;
    BlogMapper blogMapper;

    BlogViewRepository blogViewRepository;
    BlogLikeRepository blogLikeRepository;
    CommentRepository commentRepository;

    // 1. Tạo bài viết mới
    @Transactional
    public BlogResponse createBlog(BlogCreationRequest request) {
        var context = SecurityContextHolder.getContext();
        String currentUsername = context.getAuthentication().getName();
        User author = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXITED));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        Blog blog = blogMapper.toBlog(request);
        blog.setAuthor(author);
        blog.setCategory(category);

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            Set<Tag> finalTags = new HashSet<>();
            for (String tagName : request.getTags()) {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            return tagRepository.save(newTag);
                        });
                finalTags.add(tag);
            }
            blog.setTags(finalTags);
        }
        return enrichBlogResponse(blogRepository.save(blog));
    }

    // 2. Cập nhật bài viết
    @Transactional
    public BlogResponse updateBlog(UUID id, BlogUpdateRequest request) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND));

        var context = SecurityContextHolder.getContext();
        String currentUsername = context.getAuthentication().getName();
        if (!blog.getAuthor().getUsername().equals(currentUsername)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (request.getCategoryId() != null && !request.getCategoryId().equals(blog.getCategory().getId())) {
            Category newCategory = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            blog.setCategory(newCategory);
        }

        blogMapper.updateBlog(blog, request);
        return enrichBlogResponse(blogRepository.save(blog));
    }

    // 3. Lấy chi tiết 1 bài viết
    @Transactional
    public BlogResponse getBlogById(UUID id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND));

        BlogView view = new BlogView();
        view.setBlog(blog);
        blogViewRepository.save(view);

        return enrichBlogResponse(blog);
    }

    // 4. Lấy danh sách toàn bộ bài viết
    public List<BlogResponse> getAllBlogs() {
        List<Object[]> results = blogRepository.findAllBlogsWithCounts();

        return results.stream().map(row -> {
            Blog blog = (Blog) row[0];
            long viewCount = (long) row[1];
            long likeCount = (long) row[2];
            long commentCount = (long) row[3];

            BlogResponse response = blogMapper.toBlogResponse(blog);

            // 🔥 TẠO SLUG THEO FORMAT: "title-slug" + "-" + "UUID"
            String generatedSlug = SlugUtils.generateSlug(blog.getTitle()) + "-" + blog.getId().toString();
            response.setSlug(generatedSlug);

            response.setTotalReads((int) viewCount);
            response.setTotalLikes((int) likeCount);
            response.setTotalComments((int) commentCount);

            return response;
        }).toList();
    }

    // 5. Xóa bài viết
    @Transactional
    public void deleteBlog(UUID id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND));

        var context = SecurityContextHolder.getContext();
        String currentUsername = context.getAuthentication().getName();

        boolean isAuthor = blog.getAuthor().getUsername().equals(currentUsername);
        boolean isAdmin = context.getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAuthor && !isAdmin) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        blogRepository.deleteById(id);
    }

    // Trả về list Blog khi biết Category ID
    public List<BlogResponse> getBlogsByCategory(UUID categoryId) {
        List<Object[]> results = blogRepository.findBlogsByCategoryIdWithCounts(categoryId);
        return results.stream().map(this::mapRowToBlogResponse).toList();
    }

    // Trả về list Blog khi biết Tag ID
    public List<BlogResponse> getBlogsByTag(UUID tagId) {
        List<Object[]> results = blogRepository.findBlogsByTagIdWithCounts(tagId);
        return results.stream().map(this::mapRowToBlogResponse).toList();
    }

    public List<BlogResponse> searchBlogs(String keyword) {
        List<Object[]> results = blogRepository.searchBlogsByKeywordWithCounts(keyword);
        // mapRowToBlogResponse chính là cái hàm Helper bạn đã tạo ở bài trước
        return results.stream().map(this::mapRowToBlogResponse).toList();
    }


    public List<BlogSuggestionResponse> getSearchSuggestions(String keyword) {
        return blogRepository.findTop5ByTitleContainingIgnoreCase(keyword)
                .stream().map(blog -> BlogSuggestionResponse.builder()
                        .id(blog.getId())
                        .title(blog.getTitle())
                        // Vẫn giữ logic Slug ghép UUID chuẩn 3NF
                        .slug(SlugUtils.generateSlug(blog.getTitle()) + "-" + blog.getId())

                        // 🔥 THÊM LOGIC LẤY TÊN TÁC GIẢ VÀ DANH MỤC Ở ĐÂY
                        .authorName(blog.getAuthor() != null ? blog.getAuthor().getUsername() : "Anonymous")
                        .categoryName(blog.getCategory() != null ? blog.getCategory().getName() : "Khác")

                        .build())
                .toList();
    }


    // Tạo hàm Helper này để dùng chung cho gọn code, đỡ phải lặp lại đoạn Map dài ngoằng
    private BlogResponse mapRowToBlogResponse(Object[] row) {
        Blog blog = (Blog) row[0];
        long viewCount = (long) row[1];
        long likeCount = (long) row[2];
        long commentCount = (long) row[3];

        BlogResponse response = blogMapper.toBlogResponse(blog);
        response.setSlug(SlugUtils.generateSlug(blog.getTitle()) + "-" + blog.getId());
        response.setTotalReads((int) viewCount);
        response.setTotalLikes((int) likeCount);
        response.setTotalComments((int) commentCount);
        return response;
    }

    // ================= HELPER METHOD =================
    private BlogResponse enrichBlogResponse(Blog blog) {
        BlogResponse response = blogMapper.toBlogResponse(blog);

        // 🔥 TẠO SLUG THEO FORMAT: "title-slug" + "-" + "UUID"
        String generatedSlug = SlugUtils.generateSlug(blog.getTitle()) + "-" + blog.getId().toString();
        response.setSlug(generatedSlug);

        // Đếm từ DB (3NF)
        response.setTotalReads((int) blogViewRepository.countByBlogId(blog.getId()));
        response.setTotalLikes((int) blogLikeRepository.countByBlogId(blog.getId()));
        response.setTotalComments((int) commentRepository.countByBlogId(blog.getId()));

        return response;
    }
}