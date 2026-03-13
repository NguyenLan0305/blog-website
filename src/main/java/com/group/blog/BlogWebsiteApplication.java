package com.group.blog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class})
public class BlogWebsiteApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlogWebsiteApplication.class, args);
    }
}
