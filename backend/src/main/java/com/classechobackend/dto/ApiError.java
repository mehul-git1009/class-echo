package com.classechobackend.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private HttpStatus status;
    private int statusCode;
    private String message;
    private String error;
    private String path;
    private List<String> errors;
    private LocalDateTime timestamp;

    public ApiError() {
        this.timestamp = LocalDateTime.now();
    }

    public ApiError(HttpStatus status, String message) {
        this.status = status;
        this.statusCode = status.value();
        this.message = message;
        this.error = status.getReasonPhrase();
        this.timestamp = LocalDateTime.now();
    }

    public ApiError(HttpStatus status, String message, String path) {
        this.status = status;
        this.statusCode = status.value();
        this.message = message;
        this.error = status.getReasonPhrase();
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }

    public ApiError(HttpStatus status, String message, List<String> errors) {
        this.status = status;
        this.statusCode = status.value();
        this.message = message;
        this.error = status.getReasonPhrase();
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }

    public ApiError(HttpStatus status, String message, String path, List<String> errors) {
        this.status = status;
        this.statusCode = status.value();
        this.message = message;
        this.error = status.getReasonPhrase();
        this.path = path;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public HttpStatus getStatus() {
        return status;
    }

    public void setStatus(HttpStatus status) {
        this.status = status;
        this.statusCode = status.value();
        this.error = status.getReasonPhrase();
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
