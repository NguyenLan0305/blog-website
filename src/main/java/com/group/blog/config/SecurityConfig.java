package com.group.blog.config;

import com.group.blog.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
   private final String[] PUBLIC_ENDPOINTS={"/users","/auth/login","/auth/introspect"};

   @Value("${jwt.signerKey}")
   private String signerKey;
   @Bean
   public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
       httpSecurity
               .cors(org.springframework.security.config.Customizer.withDefaults())
               .authorizeHttpRequests(request->
              request.requestMatchers((HttpMethod.POST),PUBLIC_ENDPOINTS).permitAll()
                      .requestMatchers("/assets/**", "/css/**", "/js/**").permitAll()
                      .requestMatchers("/categories", "/tags", "/blogs", "/blogs/**").permitAll()
                      .requestMatchers(HttpMethod.GET,"/users").hasRole(Role.ADMIN.name())
                      .anyRequest().authenticated()
               );
       httpSecurity.oauth2ResourceServer(oauth2->
               oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder())
                       .jwtAuthenticationConverter(jwtAuthenticationConverter())));


               httpSecurity.csrf(AbstractHttpConfigurer::disable);
       // THÊM DÒNG NÀY: Ép Spring Security hoạt động ở chế độ Stateless (Không trạng thái)
       httpSecurity.sessionManagement(session -> session
               .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
       );
       return httpSecurity.build();

   }

   @Bean
   JwtAuthenticationConverter jwtAuthenticationConverter(){
       JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter=new JwtGrantedAuthoritiesConverter();
       jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
       JwtAuthenticationConverter jwtAuthenticationConverter=new JwtAuthenticationConverter();
       jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
       return jwtAuthenticationConverter;
   }

   @Bean
   JwtDecoder jwtDecoder(){
       SecretKeySpec secretKeySpec=new SecretKeySpec(signerKey.getBytes(),"HmacSHA512");
       return NimbusJwtDecoder
               .withSecretKey(secretKeySpec)
               .macAlgorithm(MacAlgorithm.HS512)
               .build();
   }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/assets/**", "/css/**", "/js/**", "/images/**", "/webjars/**").permitAll()
//                        .requestMatchers("/", "/login", "/register", "/forgot-password", "/error").permitAll()
//                        .anyRequest().authenticated()
//                )
//                .formLogin(login -> login
//                        .loginPage("/login")
//                        .permitAll()
//                )
//                .csrf(csrf -> csrf.disable());
//
//        return http.build();
//    }
//
//    @Bean
//    public WebSecurityCustomizer webSecurityCustomizer() {
//        return web -> web.ignoring()
//                .requestMatchers("/assets/**");
//    }


}