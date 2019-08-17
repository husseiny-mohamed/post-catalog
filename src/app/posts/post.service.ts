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
  private postAddedSource: Subject<Post[]> = new Subject<Post[]>();
  postAdded$: Observable<Post[]>;

  constructor(private http: HttpClient, private router: Router) {
    this.postAdded$ = this.postAddedSource.asObservable();
  }

  getPosts() {
    this.http
      .get<any>(`${environment.apiUrl}/posts`)
      .pipe(
        map((responseData) => {
          return responseData.map((post) => {
            return { id: post._id, title: post.title, content: post.content };
          });
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postAddedSource.next([...this.posts]);
      });
  }

  addPost(title: string, content: string) {
    this.http
      .post<any>(`${environment.apiUrl}/posts`, { title, content })
      .pipe(
        map((responseData) => {
          return { id: responseData._id, title: responseData.title, content: responseData.content };
        })
      )
      .subscribe((createdPost) => {
        this.posts.push(createdPost);
        this.postAddedSource.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    this.http.delete(`${environment.apiUrl}/posts/${postId}`).subscribe(() => {
      const updatedPosts = this.posts.filter((post) => post.id !== postId);
      this.posts = updatedPosts;
      this.postAddedSource.next([...this.posts]);
    });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = { id, title, content };
    this.http.put(`${environment.apiUrl}/posts/${id}`, post).subscribe(() => {
      const updatedPosts = [...this.posts];
      const oldPostIndex = this.posts.findIndex((p) => p.id === id);
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      this.postAddedSource.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  getPost(id: string) {
    return this.http.get<any>(`${environment.apiUrl}/posts/${id}`);
  }
}
