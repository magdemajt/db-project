import React, { useEffect, useState } from "react";
import PostComponent from "../posts/PostComponent";
import { generateRequestConfig, generateURL } from 'config';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@mui/material';
import { useParams } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function PostsPage(props: any) {

  const [hasError, setErrors] = useState(false);
  const [planets, setPlanets] = useState([]);
  const [likeResult, setLikeResult] = useState(new Map());
  const [titleForm, setTitleForm] = useState('');
  const [contentForm, setContentForm] = useState('');
  const [error, setError] = useState('');

  let { is_participant, id_group } = useParams();

  async function fetchData() {
    // console.log('fetching');
    const res = await fetch(generateURL('/posts/groupPost/' + id_group), generateRequestConfig({
      method: 'GET',
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
      method: 'GET',
    }));

    res
      .json()
      .then(res => {
        // console.log("value res:");
        // console.log(res.value);
        var mapp = new Map();
        res.value.map((ele: { id_posts: number, value: number }) => {
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

  function handleChangeContent(content: string) {
    setContentForm(content);
  }

  function handleChangeTitle(title: string) {
    setTitleForm(title);
  }

  async function submit(event: any) {
    if (is_participant == 'true') {
      event.preventDefault();
      // console.log("title: ", titleForm);
      // console.log("content: ", contentForm);

      const data = { title: titleForm, post_content: contentForm, id_group: id_group };
      await fetch(generateURL('/posts/addPost'), generateRequestConfig({
        method: 'POST',
        body: JSON.stringify(data),
      }));
    } else {
      setError('You cannot add post! You have to be a member of a group.');
    }
  }

  return (
    <div>
      <Grid
        container
        direction="column"
        alignItems="center"
      >
        <Accordion sx={{ width: 1000, margin: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon/>}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Add Post: </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form>
              <label>Title:</label>
              <input type="text" name="name" value={titleForm} onChange={e => handleChangeTitle(e.target.value)}/><br/>
              <label>Content:</label>
              <textarea value={contentForm} onChange={e => handleChangeContent(e.target.value)}/>
              {/* <input type="submit" value="Submit" /> */}
              <input type="button" onClick={submit} value="Add Post"/>
            </form>
            <Typography>{error}</Typography>
          </AccordionDetails>
        </Accordion>
      </Grid>
      {
        planets.map((item: any, key: any) => (
          <PostComponent
            value={item.value}
            personalValue={likeResult.has(item.id) ? likeResult.get(item.id) : null}
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
