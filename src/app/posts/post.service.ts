import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postAddedSource: Subject<Post[]> = new Subject<Post[]>();
  postAdded$: Observable<Post[]>;

  constructor(private http: HttpClient) {
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
      });
  }

  deletePost(postId: string) {
    this.http.delete(`${environment.apiUrl}/posts/${postId}`).subscribe(() => {
      const updatedPosts = this.posts.filter((post) => post.id !== postId);
      this.posts = updatedPosts;
      this.postAddedSource.next([...this.posts]);
    });
  }
}
