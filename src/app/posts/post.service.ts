import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postAddedSource = new Subject<{ posts: Post[]; count: number }>();
  postAdded$: Observable<{ posts: Post[]; count: number }>;

  constructor(private http: HttpClient, private router: Router) {
    this.postAdded$ = this.postAddedSource.asObservable();
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<any>(`${environment.apiUrl}/posts${queryParams}`)
      .pipe(
        map((responseData) => {
          return {
            posts: responseData.posts.map((post) => {
              return { id: post._id, title: post.title, content: post.content, imagePath: post.imagePath };
            }),
            count: responseData.count
          };
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts.posts;
        this.postAddedSource.next({ posts: [...this.posts], count: transformedPosts.count });
      });
  }

  addPost(title: string, content: string, image: File) {
    const postPayload = new FormData();
    postPayload.append('title', title);
    postPayload.append('content', content);
    postPayload.append('image', image, title);
    this.http
      .post<any>(`${environment.apiUrl}/posts`, postPayload)
      .pipe(
        map((responseData) => {
          return { id: responseData._id, title: responseData.title, content: responseData.content, imagePath: responseData.imagePath };
        })
      )
      .subscribe((createdPost) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    this.http.delete(`${environment.apiUrl}/posts/${postId}`).subscribe(() => {
      const updatedPosts = this.posts.filter((post) => post.id !== postId);
      this.posts = updatedPosts;
      // this.postAddedSource.next([...this.posts]);
    });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = { id, title, content, imagePath: null };
    this.http.put(`${environment.apiUrl}/posts/${id}`, post).subscribe(() => {
      const updatedPosts = [...this.posts];
      const oldPostIndex = this.posts.findIndex((p) => p.id === id);
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      // this.postAddedSource.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  getPost(id: string) {
    return this.http.get<any>(`${environment.apiUrl}/posts/${id}`);
  }
}
