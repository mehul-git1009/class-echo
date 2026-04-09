package com.classechobackend.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.classechobackend.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;

import reactor.core.publisher.Mono;

@Service
public class SupabaseAuthService {

    private final WebClient webClient;

    @Autowired
    public SupabaseAuthService(WebClient supabaseWebClient) {
        this.webClient = supabaseWebClient;
    }

    //SignUp with Supabase
    public Mono<JsonNode> signUp(String email, String password, Map<String, Object> metadata) {
        Map<String, Object> body = Map.of(
                "email", email,
                "password", password,
                "data", metadata != null ? metadata : Map.of()
        );

        return webClient.post()
                .uri("/auth/v1/signup")
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase Auth error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }

    //Login In
    public Mono<JsonNode> signIn(String email, String password) {
        Map<String, String> body = Map.of(
                "email", email,
                "password", password
        );

        return webClient.post()
                .uri("/auth/v1/token?grant_type=password")
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase Auth error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }

    //Get User
    public Mono<JsonNode> getUser(String token) {
        return webClient.get()
                .uri("/auth/v1/user")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase Auth error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }

    //Sign Out
    public Mono<Void> signOut(String token) {
        return webClient.post()
                .uri("/auth/v1/logout")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase Auth error: " + errorBody)))
                )
                .bodyToMono(Void.class);
    }

    //Update User
    public Mono<JsonNode> updateUser(String token, Map<String, Object> updates) {
        return webClient.put()
                .uri("/auth/v1/user")
                .header("Authorization", "Bearer " + token)
                .bodyValue(updates)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase Auth error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }


    //Reset Password
    public Mono<JsonNode> resetPassword(String email) {
        Map<String, String> body = Map.of("email", email);

        return webClient.post()
                .uri("/auth/v1/recover")
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase Auth error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }
}
