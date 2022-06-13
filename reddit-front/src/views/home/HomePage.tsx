import React, { useEffect, useState } from "react";
import PostComponent from "../posts/PostComponent";
import { generateRequestConfig, generateURL } from 'config';
import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material';

export default function PostsPage(props: any) {

    const [hasError, setErrors] = useState(false);
    const [planets, setPlanets] = useState([]);
    const [likeResult, setLikeResult] = useState(new Map());

    async function fetchData() {
        // console.log('fetching');
        const res = await fetch(generateURL('/posts'), generateRequestConfig({
          method: 'GET'
        }));
        
        res
          .json()
          .then(res => {
            // console.log(res);
            setPlanets(res.posts);

          })
          .catch(err => setErrors(err));
      }

      async function fetchDataValueForUser() {
        // console.log('fetching');
        const res = await fetch(generateURL('/posts/likeResultUser'), generateRequestConfig({
          method: 'GET'
        }));
        
        res
          .json()
          .then(res => {
            // console.log("value res:");
            // console.log(res.value);
            var mapp = new Map();
            res.value.map((ele: {id_posts: number, value: number})=>{
              mapp.set(ele.id_posts, ele.value);
            })
            setLikeResult(mapp);
          })
          .catch(err => setErrors(err));
      }
    
      useEffect(() => {
        fetchData();
        fetchDataValueForUser();
        // console.log(planets);
      }, []);


    return (
    <div>
    {
      planets.map((item: any, key: any) => (
            <PostComponent
              value={item.value}
              personalValue={ likeResult.has(item.id)? likeResult.get(item.id) : null }
              key={item.id}
              id_posts={item.id}
              id_users={item.id_users}
              name={item.name} 
              title={item.title}
              post_content={item.post_content}
              created_at={item.created_at}/>
      ))
    }
    </div>
    );
    
}