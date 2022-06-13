import React, { useEffect, useState } from "react";
import PostComponent from "../posts/PostComponent";
import { generateRequestConfig, generateURL } from 'config';
import { Accordion, AccordionDetails, AccordionSummary, Button, Card, CardContent, CardHeader, FormControl, Grid, Input, InputLabel, Typography } from '@mui/material';
import { useParams } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function PostsPage(props: any) {

    const [hasError, setErrors] = useState(false);
    const [planets, setPlanets] = useState([]);
    const [likeResult, setLikeResult] = useState(new Map());


    let {is_participant, id_group} = useParams();

    async function fetchData() {
        // console.log('fetching');
        const res = await fetch(generateURL('/posts/groupPost/'+id_group), generateRequestConfig({
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
    <Grid   
      container
      direction="column"
      alignItems="center"
      >
        <Accordion sx={{ width: 1000, margin: 1}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Add Post: </Typography>
        </AccordionSummary>
        <AccordionDetails>
        {/* <form>
            <label>Title:</label>
            <input type="text" name="name" /><br/>
            <label>Content:</label>
            <input type="text" name="title" /><br/>
            <input type="submit" value="Submit" />
        </form> */}
        </AccordionDetails>
      </Accordion>
      </Grid>
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