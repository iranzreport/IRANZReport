import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_ROSTER, COACH_ROSTER, SECTIONS, COACH_SECTIONS, playerKey, sessionKey, encodeEval, decodeEval, getEvalColor, scoreColor, isCoachCourse } from '../lib/constants';
const logo = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAGPA+YDASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAcIBQYJBAMBAv/EAFwQAAEDAwIDAgMSCgUKBQMFAAABAgMEBQYHEQgSITFBEyJRCRQYMjc4QlZXYXFzdZWztNLTFRc0UnSBkaOxwRYjYnayJDM2Q1VYgpOh0SU5U5LCNVSiY3K14vH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8ApkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfrUVzka1FVVXZETvA/AW2044MbhesUpbnlmUS2O41Cc60UNI2bwTV7Ec5Xp43l26fD2rsnoHbR7old82N+8ApKCyPEBwr3XTrEXZTYL2/IKCl3W4MfTpDJAzukREcvM3y96dF6pvtW4AAAAAAAAAAWB4c+Gi7apWGTJLrdnWKzPVWUcrYElkqHNVUcqNVybNRUVPKq7+9uFfgXa9A7aPdErvmxv3g9A7aPdErvmxv3gFJQXa9A7aPdErvmxv3g9A7aPdErvmxv3gFJQXa9A7aPdErvmxv3g9A7aPdErvmxv3gFJQXa9A7aPdErvmxv3g9A7aPdErvmxv3gFJQXa9A7aPdErvmxv3h/MnA5bFb/V6jVjXeV1qaqfSoBScFqMs4Kc0oYHS45lNovLmpv4KeJ9K9feTq9v7VQrrnGHZPhN5dZ8qstXaqxE3Rk7Oj0/OY5N2vT32qqAYEAAAAAAAAAtJwHaT4xm1dd8pyijhuUNpmjhpqKbZ0bpHIrud7e9E2TZFTZevbsqAVc2Xt2Pw6/OxLFVtqWxcas60KJslN5yj8F27+l227epo2YcP2j+TI/wA+4bb6Od0atSag3pnN7fG2YqNVevaqKBy6Bc3ULgoReepwLKu1d20l1b0RNv8A1WJ16/2P1lZNRdLs80/qFjyrHKyii5ka2pRvPA9VTdESRu7VX3t9wNNB9KaCapqI6emhkmmkcjWRsarnOVexERO1S2mhPCBXXSCG96nTz2ynds6O0wKiTvbtv/WP6+D7vFRFd278oFUrRbLleK+OgtNvqq+rlcjY4KaJ0j3KvYiNaiqpJ9h4b9Z7zTpUU+E1dPGq7J58mjp3dm/pXuR3f5Do5hOD4jhVA2ixbHrfaomt5VdBEnhHpvv4z18Z361UxerWqOHaY2T8JZRcmxyPT/J6OHZ9RUL/AGGb9n9pdkTygc/bxwz61WulfUyYZNUsZtu2lqYpn/qa1yuX9SEX3+yXmwXB9vvlqrbZWM9NBVwOien6nIik26u8VGouZVclPYKyTFbSi7MhoZFSd6der5fTb9exuyEL3/JMhyB0br9fbndXRqqsWsqnzK1V7duZV232QDFAAAAAAAAAAAAAANw0h09vupuaU+M2FjUkc3wtRO/0lPCiojnr5e1ERO9VTsTdUtS3gdtXKnNqHWou3VEtjVT6QCkwLRaycIN+xPGH3zELxNk60yK+qpFpUim5E9lGiOXnVO3l7duzdei1eVFRdlTZUA/AAAAAAAAAAABZXQXhSuuoOIR5RkN7kx6jrGtfb42UyTSTxr/rFRXJytXpt3r2+QkX0Dto90Su+bG/eAUlBZHiA4V7rp1iLspsF7fkFBS7rcGPp0hkgZ3SIiOXmb5e9Oi9U32rcAAAAAAAAABLfDjode9YLxULFVfguxUS8tXcFj51R6pu2Njd05nL2r1RETqvciz/AOgdtHuiV3zY37wCkoLtegdtHuiV3zY37wegdtHuiV3zY37wCkoLtegdtHuiV3zY37wegdtHuiV3zY37wCkoLtegdtHuiV3zY37wegdtHuiV3zY37wCkoLtegdtHuiV3zY37wegdtHuiV3zY37wCkoLtegdtHuiV3zY37wegdtHuiV3zY37wCkoJx4lOHi8aRU9JeKS5Le8fqHJC+rWFIpIJl3VGvZuvRURdnIvcqLt03g4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfai/LYPjG/xPifai/LYPjG/xA7JAACN+J/1vubfJMv8AI5XnVDif9b7m3yTL/I5XgAAAAAAAADpxwYetnw/4up+tTHMc6ccGHrZ8P+LqfrUwEwAAADSqnVvS6mqJKap1DxaGaJ6skjkukLXMci7Kiort0VF6bHz/ABxaT+6TiXztD9oDeQaN+OLSf3ScS+doftD8cWk/uk4l87Q/aA3kGjfji0n90nEvnaH7Q/HFpP7pOJfO0P2gN5Bo7NYNKXvRrdSMS3Vdk/8AF4E/+Rt1quVuu1CyutdfS19JJ6SemmbJG74HNVUUD1Gm6wac4/qZhlXj18pYlc9qrS1fIiy0sqelexe1Nu9OxUVUXdFNyAHHzL7BcMWyi545dY/B1tuqX08yIi7KrV23TfuXtT3lQxRYTzQCyQ2rX19bCzl/C1rp6yRfK9FfEv8A0iQr2AAAAAACzXmfGdQY/qZXYlXzpFTZDAiU6uVETzzFurU3X85qvRPKvKhWU+1DVVFDWw1tHM+CogkbJFIxdnMci7oqL5dwOp3Elkd7xPRPJL/jr/BXKmp08FKibrEjnta56e+iKq/qOYdflGS19e6vrcgutRVudzLNJWSOeq+XdV3Oi+gGpFm100lqrXe0ifdUpXUV7pNuXnR7Vb4VqfmuTr07F3TyFAdZMAu2mmf3DFrq1zvAP56Wfl2bUQKq8kifCnRU7lRU7gMvh2ueq2KytdbM0uckbdk8DWSeeI1RO7aTfb9WxY7STit/ptc6LC88wiK4vukzaZH0MSSxvVyoic8L9/FTtVUVdkTfYpU1qucjWoquVdkRE6qdDeDTRCDAsZiy3IKRrsoucSOaj060ULk6MTyPVOrl/V3LuElYnoxpli2Vz5RY8SoaS6Sqrkk8ZzYVVd1WNjlVsa++1E27E6EgAjHiI1es+kuHPuFRyVV4qmuZbaLm6yP/AD3d6MTv8vYnvB4uI3XCw6R2FWORlfkdVEq0FvRV270SSRe5iKnwr2J3qnN7OctyDNsjqcgyW4zV9fUO3c969GJ3NanY1qdyIfPMslvWX5JW5FkFdJW3Gsk55ZX/APRETsRqJ0RE6IhhwAAAAAAAAAAAAAAAALP+ZwerFff7vyfWIC/JQbzOD1Yr7/d+T6xAX5AFV+K3hmgylarM9P6SOnvrt5Ky3sRGx1q97m9zZF7+5y9uy7qWoAHGyrpqijqpaSrglp6iF6xyxSsVr2ORdla5F6oqL02U+R0X4pOHa16lUs2SY6yG35ZEzq/bljrkROjZNvZdyP7e5d022575DZrrj16q7Le6CeguNJIsc9PM3lcxyfy70VOioqKnQDwAAAAAAAA6t8OvqD4N8hUn0TTfTQuHX1B8G+QqT6JpvoEb8T/rfc2+SZf5HK86ocT/AK33NvkmX+RyvAAAAAAAAAvd5m16muTfLCfQsLVFH/M/9TsWxqK74Vf62O21Nxqkq6SpqHoyF6oxGrGrl6Nd4u6b9F/jcH+m2Ge26wfOMP2gM+DAf02wz23WD5xh+0P6bYZ7brB84w/aAz4MB/TbDPbdYPnGH7Q/pthntusHzjD9oDPgwH9NsM9t1g+cYftD+m2Ge26wfOMP2gM+Aioqbp1QAADQtcNUsf0pw6W+Xh6TVUiKyhoWO2kqpduiJ5Gp2q7uTyrsihFPmhl4tdNoxTWWeuhZca25xSU9Mrv6yRkaO53InkTdOvZuqJ3nPo2XUvN8g1Cy+ryfJKtaisqF2axOkcEaeljjT2LU37PhVd1VVNaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH2ovy2D4xv8AE+J9qL8tg+Mb/EDskAAI34n/AFvubfJMv8jledUOJ/1vubfJMv8AI5XgAAAAAAAADpxwYetnw/4up+tTHMc6ccGHrZ8P+LqfrUwEwAADkLqN6oWSfK1V9K4wJntRvVCyT5WqvpXGBAAAAAABcvzNK5VTnZraHTPWlYlJUxx7+K16+Fa5ye+qNZ/7UKaFv/M0f/r2bfotJ/ilAuyAAKEeaQIn43rAvf8AgBn1iYq8Wh80g9V2wfIDPrExV4AAAAAAAADbdJ9QMg01zKlybHqjlmi8SeB6r4OpiVU5o3onai7fCioip1Qu1nthxDiq0dp7/jM0NJklA1VgSVU8JTS+yp5duvI7bdHfAqd6HPg3XR3UvJNL8siv2P1HRdmVVLIqrFUx79WuT+C9qKBMPB1otX3nVysr8ttctPSYpOnh6eePpJVoq8jF7lRu3MvanRvcp0CTomyGjaL6lYxqhijb/j0jI5t0bXUblTw1NLt6V+3ankd2Kn60TeQMRmeTWTD8arMiyKubRWyjajppnNV226oiIiIiqqqqoiInlKMcWmL3jPaifWbFb/FlOHviZGjYXr4S1ta1qKx8a7K1Fcqr2b7u69qKsw8Tur82LZy3DM209W6ad3CBjaiqcj0fUO6Oc6JyKjd2KrfF7d07U3QqDqdJjuPX6ttumeYXK4YzdKdkk0TvCQq3dd/ASp0R6t2Tr1TsA0IAAAAAAAAAAAAAAAAAAWf8zg9WK+/3fk+sQF+Sg3mcHqxX3+78n1iAvyAANFodU8Wn1auemNRO+iv9HHFLC2fZGVjXxNk/ql36uajurV2Xpum/XYN6Ig4j9C7Bq1ZfPCJHb8lpY1SjuDW+mTt8FL+czfs72r2dqosvgDkLnmI5Bg+TVOO5LbpaGvp13Vrk8WRi9j2L7Jq9y/zRUMCdVtc9JcZ1YxhbZeoUgr4EV1BcY2p4Wmev+Ji9N2r0X3lRFTmzq1pzk2meUyWHJKRWLurqapYirDUsT2TF/Wm6dqb++m4aeAAAAA6t8OvqD4N8hUn0TTfTQuHX1B8G+QqT6JpvoEb8T/rfc2+SZf5HK86ocT/rfc2+SZf5HK8AAAAAAAAAAAAAAAAAWz4NeHhb7JSaiZzRKlpYqS2qglb+VqnZM9F/1aexT2Xb6XbmwfB9w+yZxXwZrl9GqYzTSc1NTSt2/CD2r3p3xovb+cvTs33v/GxkUbY42NYxiI1rWpsiInYiIB/QBrepObY/p/iVXkuR1aU9HTt8VqdZJn+xjYne5f8A/egHk1c1Cx7TTDKrJchqUZGxOSmgbsslTMqeLGxO9V7+5ERVXZEOY2ruomQamZhUZFf513cqtpqZrlWOmi36Mb/Ne9f1Inv1z1TyDVfMpL5eHrDSRbx2+ga7eOli37E8rl2RXO7VXyIiImgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPtRflsHxjf4nxPtRflsHxjf4gdkgABG/E/wCt9zb5Jl/kcrzqhxP+t9zb5Jl/kcrwAAAAAAAAB044MPWz4f8AF1P1qY5jnTjgw9bPh/xdT9amAmAAAchdRvVCyT5WqvpXGBOlV04WNHblc6q41dmuD6iqmfPK5LjKiK9zlcq7IvTqqnm9CXor/sO4/Oc3/cDm8DpD6EvRX/Ydx+c5v+49CXor/sO4/Oc3/cDm8DpD6EvRX/Ydx+c5v+49CXor/sO4/Oc3/cDm8XE8zQp5FuWcVXKvg2w0UfNt03V0y7b/AKiX2cJmijXo5bBXvRPYrc5tl/Y4lDTzA8S0/s7rTiFlhtdLI/nkRjnPdI7bbmc5yq5y7eVQNlAAFCPNIPVdsHyAz6xMVeLHeaF3aG4a6U1FDI1622zQQSonsXufJJsv/C9pXEAAAAAAAAAbpohhSah6o2XEZKh9NDXSuSaZibuZG1jnuVPf2b0NLLF+Z722Gt13lq5mczqG0TzRLvtyvVzGb/se79oGv5ZjOpfDPqXHdLdPKyn53pRXBsfNT1sXVOWRvVEdt2tXqnancpbnSvWe0626eXKyWi6R45mk1BLCsD3rvHKrFRJol7XNRV36eM3b3t1l3MMZsOXWGex5JbILjb5vTwyp037lRU6oqeVOpyw1BZbsN1au0WA3mu852q4ObQVqScsqKxe1HNXqiORUR3eiIvTfYCS81zDVrTG0XjTHUq2xX+318L1pXXbeoSNzk2SeCbfddu5N+i79E6kBFwtNNeML1Xxxunuu1DSrUzL4OlvPI2NnMvY5zv8AUv3RPGTxV70RN941184bskwBkl/x2R2R4q9EkZVwJzSwMXqnhGp2t/tp0Xp2b7AQOAAAAA2zC9PMrzGwX6949bH1tLYoWTVvIvjo1yr6Vva5URqqqJ2IhqioqLsqbKTbwn62SaUZRLQ3Rnh8Zur2pXNa3d8Lk6Nlb5dt+qd6e+iEo8W2gFFUWt+qmmlOya31EXny4UVMni+DcnN54iRPY7Lu5qdnanTfYKgAAAAAAAAAACz/AJnB6sV9/u/J9YgL8lBvM4PVivv935PrEBfkAc4OOCoqKPibu1XSTy09RDBRSRSxPVr2PSFio5FTqioqJ1Q6PnNvjs9cje/0Wk+gYBP/AAp8TMGWrS4bn9VFT39USOjr37Mjrl7Ea7ubIv7HL2dV2LSnGhFVqoqKqKnVFQuZwpcT7nJR4RqVXIqptFQXmZ3VydjY53L39yPXt9l16qFyzVdUsAxrUjFJ8dyeiSenf40MzdklppNukkbu5yfsVOioqLsbS1Uc1HNVFRU3RU7z9A5Ya86PZLpNkS0d0YtXap3r5xuUbFSOZO1Gr+a/btavkXbcjY7A5ljNjzDHKvHsjt0NwttWzllikT9jmr2tci9UcnVF7DnLxJ6C3zSe6vrqTw1zxad+1NXcvjQ7r0jm26I7uR3YvvKuwEMAADq3w6+oPg3yFSfRNN9NC4dfUHwb5CpPomm+gRvxP+t9zb5Jl/kcrzqhxP8Arfc2+SZf5HK8AAAAAAAAAAAAAAFgOEvQKq1NuzMkyKGWnxCjl2cvVrrhI1esTF/MT2Tk+BOu6tw/C9odctWMj8+VzJaXFqGRPPtUnRZndvgY18q96p2IvlVDpHYbTb7FZqSz2mljpKGjiSKCGNuzWNTsREA+9BSUtBRQUNDTxU1LBGkcMMTUayNqJsjUROiIiH2BjsmvtpxqxVd8vldFRW+jjWSeaRdkaifxXyInVQPhmmT2TDsZrcjyKvjobbRx88sr+/yNana5yrsiInVVU5mcQmr971ay11dVLJS2elcrbdQc3SNv57tuivXv8nYnlXJcTOtt21bybkhWWjxmhkX8H0KrtzL2eGk8r1T9TUXZO9ViAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH2ovy2D4xv8T4n2ovy2D4xv8AEDskAAI34n/W+5t8ky/yOV51Q4n/AFvubfJMv8jleAAAAAAAAAOnHBh62fD/AIup+tTHMc6ccGHrZ8P+LqfrUwEwAAACB7txY6R2u61dtqqi9JUUk74JUbQKqczHK1dl36puh5fRf6Of/c3z5vX7QFggV99F/o5/9zfPm9ftExafZnjueYzT5DjFwZW0M3TdOj43J2te3ta5PIoGwAAADy3itS22mruLqapqkpYXzLDTM55ZEairysbum7l26J3qV+reMbSmklkifb8rdLG5Wvj84RtciouyoqOlTZfhAsWYHP8ALLNg+I1+T3+pbBQ0UfO/qnM93Y1jUXtcq7IiFZsl43cdipXJjeFXWqqFTxVuE8cDGr5dmc6r8HQq5rDq3mmqd0ZVZPcG+doV3p6GnbyU8PTbdG79XdvjOVV6r2J0AwGouU1+bZzeMruXSpudU6ZW77pG3sYxF8jWo1qfAYAAAAAAAAAAAWQ8zxr4KXXOqpZXta+ss08cSKnpnI+N+yf8LXL+oi+i0wvE2hlw1RkY9lFBc4aOBu3+cjXmbJJ2diSLG1Nu/m8h/PD3mUeA6xY7k1Qu1JT1Pgqtdt9oZGrG9fhRrlVPfQDo9xA5euC6P5Fkcb1ZUw0ix0qoiLtNJ4jF2Xp0c5F/UcpXuc97nvVXOcu6qvepenzRnIGs00xm000iSRXO4LUpIx+7XMjj6fCi+ERd/eKKACadBuInMNMnx2ypc6+Y2q7Pt9Q9d4m79fBOX0i9V6dU69hCwAufetKNIOICzy5JpPdKfHskXd9TbZlRjd9+vhIU3Vnamzmbt7tt+yrmpOnOYaeXd1tyqzT0T/8AVzbc0MqeVj06KYCyXa52O5w3Oz19TQVsDkdFPBIrHtVPIqFp9LOK2judqZiWs9jp7zbZkSJ9wSBr/F8s0Sps7bp1bsvTfZVAqWC6GS8MGneo1kXKNGcshhbM5VSllk8LTIu6eLv/AJyJU8jkd2p2dpXHUTRbUvA1fJf8WrW0jE3Wspm+HgRN9k3ezdG/AuygR6XC4BtWXLUSaUZFOs9PUNfJaHTORWsXZVkg69ypuqJ5d026lPlRUXZU2U2LTGqu1FqNjtXYmSPucVzgdSsY3mVz0kTZNu/fs2AmrjR0Qj09vzMtxuBW41dZla+FqLtRTr15P/2O6q3ybKncm9cjrxqDilqznC7jjF6gbJS18CsVXJusT9vFe3+01dlT4Dk9meP1+KZZdMbubEbWW2qfTS7diq1dt095e1PhAxAAAAAAAALP+ZwerFff7vyfWIC/JQbzOD1Yr7/d+T6xAX5AHNvjs9cje/0Wk+gYdJDm3x2euRvf6LSfQMAgsAAWn4UeJifFfO2FagVUtTYukdDcXrzSUPkY9fZReRe1nvt9LeyjqaespIquknjnp5mI+OSN3M17V6oqKnahxsLCcLXEXcdNauHG8nknuGIyv2TtdLb1X2cferPKz9beu6ODooeS82y3Xm2VFsu1FT11FUxrHNBOxHse1U2VFRfeU/mxXa2X20092s9dBXUNSxHwzwv5mPavYqKe0DnlxTcOFw07qZ8nxKKevxR7le+Pq+W3/wBl3e6PyO7U9l5VrodlZ4YqiF8M8TJYnpyvY9qOa5PIqL2lHOLDhlfYVq8306o3SWlVWWutMSbupO9XxJ3x+Vva3u6dGhanh1VF0HwbZd//AAKk+iab6R3wzypLoBhD29iWeBv/ALW7fyJEAjfif9b7m3yTL/I5XnVDif8AW+5t8ky/yOV4AAAAAAAAAAACVeHDRm8auZYlMxZKKwUbkdcq/b0rf/Tj36LIv7Gou69yLjNB9Kb9qxmLLNa2ugoINpLjXubuymj3/wCr12VGt7/gRVTprp5hthwPFKTG8do201FTM239lI7ve5e9yr1VQPZiOO2bE8cosesFDFQ22ijSOGGNOxO9VXtVyruqqvVVVVUyoPjW1VNRUc1ZWTx09PCxZJZZHI1rGom6qqr2IB/F2uFDabZU3O51cNHRUsTpZ55no1kbGpurlVexEQ5xcVOu1dqnf32qzyzU+J0Uq+dolRWuq3J/rXp3f2Wr2dq9eiZXi41/qdSLnJi2MzyQYlSS+M5N2uuEjV6Pd/8ApovpW/8AEvXZG14AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH2ovy2D4xv8AE+J9qL8tg+Mb/EDskAAI34n/AFvubfJMv8jledUOJ/1vubfJMv8AI5XgAAAAAAAADpxwYetnw/4up+tTHMc6ccGHrZ8P+LqfrUwEwAADkLqN6oWSfK1V9K4wJntRvVCyT5WqvpXGBAEiaFatZJpNlLbpaJFqLfMqNr7dI9UjqWf/ABenc7u99N0I7AHXDS/Pcc1GxKnyTGaxJ6aXxZYnbJLTybdY5G9zk3+BU2VN0VFNoOUWiuqOS6VZay+WGbwkEmzK6gkcqRVcaL6V3kcnXld2ovlRVRelmkmpGMam4rDf8bq+ZFREqKWTZJqWTvY9PKnlToqKip2gbiV24oeG61ahwTZNikUFsyqNm8jUTlhr0ROx6J2P8j07exd+ipYkAcdshs11x69VVlvdBPQXGkkWOenmbyvY5P5d6KnRUVFToeA6f8Q2h2N6t2hHzoy3ZBTs5aS5sZ4yJ3MkT2bN+7tTrsqbqc5dScFyXT3KJ8dyi3upKuJd2PTrFOzukjd7Jq/9OxURUVANaAAAAAAAANh03xK5ZznFpxS0t/yq41CRc6pukbO17195rUVf1GvF6fM+9L1tGN1GpN2p+WsurVp7a17VRWUyL4z/APjcn7GIqdoE/TacY47SSTTSGmSKzOtq0CbJ4yeLsknvv5tn7+XqcqsostdjmR3Gw3OJYqy31MlNM1U7HMcqL+rodhik/H3pDVx3f8aVho1lpJ2MivLI29YpE8VkyonsVTZqr3KiL3gQjmOoj830UsGN3qpc68YrUuZSyP6+eaORqNRObffmjVjU272r3cvWLQAAAAAADN4dluSYddm3XGL1WWurbtu+CRUR6IqLs5OxybonRUVCzmmPGheaOOKh1AsMV1i3Rrq6h2im5e9XRr4rl+Dl7CpAA6O2K/cM2rCq9aLFJbhUonhIa2kZS1Suf3bqiK52/e1V69/YSHhOlemeIzpWYziNmpKhHczKlIkllav9mR+7kTp2Ipy5TFMn/o9FkbLBc32eVytZXspnugVyKqKnOibIqKi9N9z7WLNsysESw2XKr3bY+bmWOmrpI279m+yLtv0A66STwxtVXysaieVTmJxdX2zZHxAZHdLFVQ1dG50MXhourHvjiYxyovem7VTfsXboaXd85zi/w+c7pld+uMTl/wAzNWyyNVV6elVdjGX+w3uwS00N8tNbbZaqBtTAyqhdG6SJyqiPRHJvsuy9QMaAAAAAAACz/mcHqxX3+78n1iAvyUG8zg9WK+/3fk+sQF+QBzb47PXI3v8ARaT6Bh0kObfHZ65G9/otJ9AwCCwAAAAEycNuvF90mvDaSo8NcsXqH/5XQc3jRb9skO/RHd+3Y7v2XqnRvC8osOY47S5BjdyhuFvqmI+OSNeqeVrk7WuRd0VF6oqKcgCSdBtYcl0lyNK22PWrtU708/W2R+0cyfnJ+a/bsd8G+4HU8/HIjmq1yIqKmyoveavpdn2Naj4pBkeM1qT08nizRO2SWnk26xyN9i5P2KmypuioptIHwt9FR26jjorfSQUlNHv4OGCNGMZuu67NTonVVU+4AEb8T/rfc2+SZf5HK86ocT/rfc2+SZf5HK8AAAAAAAAAblpBpzkGpuY0+O2GFU3VH1VU5u8dNFv1e7+Sd6+RN1TxaaYRkGoWX0mMY3SLUVlQu7nr0jgjT00j19i1N+34ETdVRDptohpdj+lWHRWOzsSapeiPrq57dpKmXbq5fI1OxG9yeVd1AyOlGn+Paa4dTYzjlNyQxePPO9E8LUyqnjSPXvVdvgRERE6IbYAB+SPZGx0kjmsY1FVznLsiInepQXjD4g3ZnXVGEYZWu/o3A/lq6uNdvP707UavfEi9/svg7ZA4ydQdQ74+r07wTEsoW1NVYrrcYLXOqVa98Mbkb/m/K5PTdnpd+apf4uNQ/aHlPzRP9gDVgbT+LjUP2h5T80T/AGB+LjUP2h5T80T/AGANWBtP4uNQ/aHlPzRP9gfi41D9oeU/NE/2ANWBtP4uNQ/aHlPzRP8AYH4uNQ/aHlPzRP8AYA1YHtvVou1krVobzbK221SNR/gKuB0MnKvYvK5EXZTxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD7UX5bB8Y3+J8T7UX5bB8Y3+IHZIH41Uc1HNVFRU3RU7z9Ajfif9b7m3yTL/I5XnVDif9b7m3yTL/I5XgAAAAAAAADpxwYetnw/4up+tTHMc6b8F6ovDRiKIqKqR1KL73+VTATCAAOQuo3qhZJ8rVX0rjAme1G9ULJPlaq+lcYEAAABuGkmouR6Z5ZDkGO1KtVNm1NM9V8FUx/mPT9uy9qftRdPAHV3RTVLG9VMTZerHOjKiNEbW0T3J4Wmk8ip3ovXZ3YpvZyP0wzzI9Ossp8jxmtWCpiXaWN26xVEe/WORve1f2p2psqbnSzQjVvHNWsVbdLRIlNcYERtwtz37yUz1/xMXryuTt95UVECRDTNXNNMW1Pxp9kyaj59kVaaqi2SameqdHMdt0+DsXsXobmAOVuumj+UaTZCtDeIvPVtmeqUVyiYqRTp3Iv5r9u1q+RdlVOpHJ2CzDGrHl2O1eP5FbobhbatnLLDKn7HIva1yL1RU6ovYcz+JrS6m0n1FWwUN2Svo6mBKumR6bTQxuc5EbJ02VfFXZU7duxAItAAAAAbzoXgFZqXqZa8Xp0elPI/wtdK3/U07VTndv12Vd0ai+VyHVW02+jtNrpbXb4GU9HSQthgiYmzWMaiI1ET3kQrtwB4BQ4/pa7MnPgqLnkLlXnY5HeBgjcrWx7ovReZHOcnRd9kX0pZMAQzxhai0+A6O3GKJ8Trte2Ot1FE5EXZHtVJJFRe5rN/e5laneTK5Ua1XOVERE3VV7jmVxc6lLqPq1WSUc6yWW0c1Fb0Rd2uRF/rJU6qnjOTtTta1oEOgAAAAAAAAAC0/mfmpSWTMKrTy5z7UF7VZqHmXoyqa3q3/jan7Wp5S6VdhGF19S+prsQx+qnequfJNbYXucq96qrd1OR9qr6u13OludvnfT1lJMyeCVnpmPaqOa5PfRURTq1ohnlHqTpnaMrpuRs1RFyVkLV/zNQzpIz4N+qeVFRe8DO2fFsYs03hrRjlnt0qpsr6Wijidt5N2ohDHG7pd/TrTJ9/tkHPe8dY+piRqKrpqftlj/YnOnfu3ZO0n8+dRBFUROinYkkbk2cx3VFTyKneBxrBLXFjp/RadayXC1WuSL8HVrG19LCxyKtO2RXbxqnds5F2/sq0iUAAAAAAs/5nB6sV9/u/J9YgL8lBfM4VRNY74iqiKuPyInv/AOUQF+gBzb47PXI3v9FpPoGHSQ5t8dnrkb3+i0n0DAILAAAAAAABuekOpWT6YZSy+Y5Vuajtm1dI9y+Bqo0Xflen8F7U/WqL0m0Q1WxnVfFm3axzpFWQoja6gkcnhaZ6+VO9q9dnJ0X4UVE5TGw6eZpkWA5TTZJjFwfR11Ouy97JWL2xyN9kxduqfAqbKiKgddwRPw7a249q1YtonMocgpY0Wttz3+Mnd4Rn5zN+9OzfrsSwBG/E/wCt9zb5Jl/kcrzqhxP+t9zb5Jl/kcrwAAAAAAZnCsYvWY5NR47j9E+ruFY/kjY3sRO9zl7monVVMMWT8zr9XW4f3fqPpoALccPGkNk0lw5tvpGMqbxVIj7nXqnjTPTsankY3fo34V6qqqSaAAAAAAAAAAAAAAAVl80Mx2zVGkdNkktBEt2o7hDBDVImz0jejuZqr3p0TopQE6J+aBet+f8AK1N/8znYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhNOeLTUTEMWprDNRWu+NpU5Iqmv8Is3J3NVWuTm28q9fL16rsfo2s99qWNfv/tlWABM2tvEZnOqVihsVfFRWi1tdzz09BzolS5PS+EVzlVUTtRvZv1XfZNoZAAAAAAAAAAEt6Ha+5rpPSVNutTaS52yZedtHXc6shfv1cxWqipv3p2b9fLvEgAtP6NrPfaljX7/7Zh804wdR8gxqss1JbrPZJKpng1raJJfDxtXt5Fc5Uaqp0323Tu2XqVwAH65znOVzlVzlXdVVeqqfgAAAAAAANi07zPIcByqlyXGa91JXU67L3smYvpo5G+yYvenwKmyoiproAtP6NrPfaljX7/7Y9G1nvtSxr9/9sqwALT+jaz32pY1+/wDtkBarZzdtRs6r8uvTIYqqs5E8DDzeDia1qNa1vMqrt037e1VNVAAAAAABMWhfEJmGktjrLJaqOgudvqJ/DshredUgfts5Wcrk9Ns3dOzpv3qSL6NrPfaljX7/AO2VYAFksu4w9QMgxi5WRlksltWup3wLVU3hkliRybKrFV+yLtvsvcVtAAAAAAAAAAAAASvoNrtlWkFPcqOzUdDcaOve2R1PWK/kjkRNle3lcnVU2Rd/zUIoAFp/RtZ77Usa/f8A2x6NrPfaljX7/wC2VYAGcz3KbtmuYXPKb3KklfcZ1lk5ejWJ2NY1O5rURGp7yIYMAAAAAAAzuCZZfcIyekyPHK19JX0zt0VPSyN72PT2TV70/WmyoiliW8bOeo1EXFMbcqJ2r4br/wDmVZAFpKjjY1BfBIyLF8aikc1UY/lmXlXbouyv67Fa8jvV1yO+Vl8vldNX3GskWWoqJXbue5f4InYiJ0RERE6IY8AAAAAAAAAAABksYv14xi/Ul9sFwnt9ypJEkgnhds5q/wAFRexUXoqKqL0LJU/GxqCyCNkuL41LI1qI9/LM3mXbquyP6blWwBM2tvEZnOqVihsVfFRWi1tdzz09BzolS5PS+EVzlVUTtRvZv1XfZNoZAAAAAAABmcLye94fklJkOPV0lFcKR/NHIxeip3tcne1exUUwwAtMzjZz5GNR2KY05UTqu03X/wDM/fRtZ77Usa/f/bKsAC0/o2s99qWNfv8A7Y9G1nvtSxr9/wDbKsAC0/o2s99qWNfv/tj0bWe+1LGv3/2yrAAtP6NrPfaljX7/AO2PRtZ77Usa/f8A2yrAAtP6NrPfaljX7/7Y9G1nvtSxr9/9sqwALT+jaz32pY1+/wDtj0bWe+1LGv3/ANsqwAJN1z1tzHVyqpPw66nordRpvDb6PmbCknfI7mVVc7bpuq9E7Nt13jIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAem1W+uutyp7bbKOetramRI4KeCNXySPXsa1qdVVfIh5iQuGv1fcH+Wqf/GgGo5Njt/xi4pbsjstwtFYsaSJBW07oXqxd0RyI5EXbovX3lMWdJ+KTTOy6u43WWq1VVKua2CFtTSxpI3wiMk3VI5EXsZJyrsv5zU8ioc5FtlxS8rZloahLklR51WlWNfC+G5uXwfL283N027dwPVi+M5FlNbJRY3Y7jeKmNnhHxUVM+Z7W77cyo1FVE3VDxXW311quVRbbnRz0VbTSLHPTzxqySN6drXNXqip5FOkPC5p7ZNJcdosar54UzW+UrrjXx7bv5I1a1WNVOnJGsjU7ernKqe9RfiU9X3OPlqo/wAagR6em12+uutxp7bbKOetramRI4KeCNXySPXojWtTqqr5DzFsOBrCaCz2+9615UxIbbZ6eVlvfI3xd0avhpk6ddk8RFTvc7yAVsyrD8sxRadMnxq72XzzzeA8/Uj4fCcu2/LzIm+26dnlMEX4ud0tPFfoFem0FuZbsks9VJLR0zpedzJGoqxpv06SM8RVVNkdv5EKFTxSwTyQTRvjljcrHsemzmuRdlRU7lA92PWO85Dc2Wyw2usulc9FcynpIXSyORO1Ua1FVT15ViGVYo+BmT45drK6oRVgSupHw+ERNt+XmRN9t0328qGOs1yr7Ndaa62qrmo62lkSSCeJ3K5jk7FRS8emGoeG8S2nsum+oDIqTJ2xc0UjURHSPanSeBV7Hp3s7037U3AoibPedPM8stkW93jDb/b7Y1GuWrqaCSOJEcqI3xnIidVVNvhLSaN8NlPp1k92zfVmuoG2XH5lkty+ETwdTy9W1D038VE6bMXrzb9yIqwvxPa3XPVrJUgpvCUeM0EjvOFJuqLIvZ4aRO96p2J7FFVE7VVQhw2C94TmFjslPfLzi95t1rqVYkFZU0ckcMqvarm8r1TZd2oqp5UQ18vFxhes8wX462fUpQKOmdtuG5bcsdqMjt2M3irs1NzeHr4KOR8EXKiK7meibJsioq7r0MEdAOBautVt4aK+tvlVT0ttiutUtVNUORsbGKyJFVyr0ROoHP8ABOHFvo2/TLMfwrZYXvxO8PV9DInVtPIqczoFVO5Oqt8rfLyqp/XCJpE3UXMn3u/QK3E7Gvhq6R6eJPIiczYevansndvi9PZIoEW3fCcwtFggv91xe80NpqOTwNbUUcjIZOZN27PVNl3RFVDXzoDx1XK3Xjhmtt2s87J7dWXKjmpZWNVrXxOjkVqoioioioqdxz+Az+K4Vl+VxTy4xjF4vTKdzWzuoaN8yRqu+yO5UXbfZf2GBcitcrXIqKi7Ki9xdrzNL/R7Nf0uk/wSFK6/8uqPjXfxA/imgnqqiOmpoZJ55XIyOONquc9y9ERETqq+8bnDpFqpNE2SPTjLHMd2L+CJ/sm98C8MU3EhY1liY9Y6erezmTfld4B/VPf6qSFr1rnrfjWsGSWLHLnPFaaOr8HSsbZ4ZURnI1fTOjVV6qvaoEBv0f1WY1XO03yxGom6r+CZuif+01G6264Wqvlt90oaqgrIV2lp6mJ0cjF8itciKn6yd6LiS4gmVkD6y7VT6ZsjVmalig3Vm/jJ/mk7tzCcWeqWOar5xQXrHrRcKBtHRrSSvrWMbJNs9XNXZqrttzOTqq/qAhk3Wj0m1QrKSGrpNPcpnp542yRSx2uZzXscm6ORUb1RUVF3NKOh+tuZ5lgvC/hd5weofBc5I7dTve2kbUL4J1I5V8VzXJ2tb12ApV+J3Vj3Nst+aZvsmPyDTfUDH7VLdr7hWQ2y3wq1Jamrt8sUbOZUam7nIiJuqonwqSi/iR4iWNV771UNa1N1VbFToiJ/yjVM8191TzjF6rGcmyKKstdUrFmhSggjVysej2+MxiKnjNReigReAAP7hiknmZDCx0kkjkaxrU3VyquyIhsOSYDm+NW5tyyHEb5aaJ70Y2orKGSKNXL1ROZyIm6mtlx+FfWKz51jD9FtVEhrIqqDztbqqoVESdm2yQvd2pInax6dV27eZEVQpwbDi2D5nlVNNU4zit6vMED0jlloaKSZrHbb8qq1FRF267Ew5Rwu5jRa2U+E2pJJ7JXPWamvD41WOKmRU5vCbf6xu6Jt05l2VNkVdpT4gtSbDobgsGjulsjYbwkHLcKxi/1lKjkRVc53fM/dV/soqL06AUwrqWpoa2eiraeWnqaeR0U0MjVa+N7V2c1UXqioqKmxmcZwnMcnidNjmK3u7xNcrVkoqGSZiO7duZqKm/vGBcqucrnKqqq7qq95fqPJbvp9wFWbI8SqI7dcqehpHxy+BZIiOlqWpIqteioqqj3dqd4FPvxO6se5tlvzTN9k/ibSLVSGJ0kmnGWNY3tX8ET/AGTdvRVa4+26H5qpfuyRuGjiC1XzPW/HMZyLJIqu11r50qIUt9PGrkbBI9PGaxFTxmovRQKo1lNU0dVLS1lPLT1ETlZJFKxWPY5O1FReqKfxFG+WVkUTHPe9yNa1qbqqr2IhPnHxTQQcQ1Y+GJkbp7dTSSq1Nud3Krd19/ZqJ+ohDHP9Ibb+lxf40A9+V4bluJtp3ZPjN3sqVSuSBa6jfD4Xl25uXmRN9uZN9vKhgS6fmmP5Dgfxtf8AwpylgGwW7CMxuONzZJQYveaqywNe+W4RUcjqdjWdXqr0TlRG7devQ18vHoX6wHK/k+7/AOB5RwDMYti+SZVVy0mM2G5Xmohj8JLFQ0z5nMZuicyo1F2TdUTc2L8TurHubZb80zfZJu8zb9U7JfkVPpozB6ycQmsNh1Zy2yWnM5qa30F4qqemhSipneDjZK5rW7ujVV2RE7VVQIrfo/qsxjnu03yxGtTdV/BM/RP/AGmn3CirLdWy0NwpJ6OqhdyywTxrHJG7yOavVF+Es1w48QOrORa045YL/lP4SttwqFgnglooG7orVXdFYxqoqKid5i/NDqeCDXekfDDHG6axU8kqtaic7vCzJzL5V2RE395AK4gADI49Y7zkV0jtVgtVbdK+RrnMpqSF0sjkRN1VGtRV6J1Np/E7qx7m2W/NM32Te+BH1x9m/RKv6Fxv3Fbrjqnhmul9x3Gcslt9rpmUyw06UkD0ar6eN7ur2KvVzlXqveBA34ndWPc2y35pm+yalerRdbJXut96tlbbaxqIroKuB0UiIvYvK5EXYm7AeJXWiozix0tdmC1lLPcIYZoJaCnRsjHvRqoqtjRU6L3KhI3ml1PAy74PUshjbNLBWtkkRqczkasHKir37cy7fCoFPjbrRpjqPd6NlZbMDyasppGo5ksNrmcx7V7FRUbsqe+hisFghqc2sVNURtkhluVOyRjuxzVkaiov6i8nG9qtnOmNTiUWFXeO2suEdWtS1aSKXm8GsPJtztXbbnd2eUCnn4ndWPc2y35pm+yeO76Y6j2ijfWXPA8mo6aNqufLNa5msY1O1VVW7Invqb/6KrXH23Q/NVL92WQ4IdVs51OqctizW7x3JlvjpFpmpSRRcvhFm59+Rqb78je3yAUCN1o9JtUKykhq6TT3KZ6eeNskUsdrmc17HJujkVG9UVFRdzB5zBDS5rfaWnjbFDDcqiONjexrUkciInwISVaeJvWi1WqktlDlUMdLRwMggYtspncrGNRrU3WPdeiJ1UDVvxO6se5tlvzTN9kfid1Y9zbLfmmb7JdnD9S8yuHBhW6j1d1ZJk0VHWSsq/O0SIjo6h7GL4NG8nRqInYVZ9FVrj7bofmql+7AhSWN8Ur4pWOY9jla5rk2VFTtRTa7JplqLe7XBdbPg2R3CgqGq6GpprbLJHIiKqbtcjdl6oqfqNWqZpKmplqJnc0kr1e9dtt1Vd1L94jkOQ4pwD27IMVldFeaSgatM9sDZlRXVvK7xHIqL4rndqAU6/E7qx7m2W/NM32Tz3LSvUu2W+ouNxwDJqSjponSzzzWyVkcTGpu5znK3ZERE33Ukr0R/EV/tip+YoPujA5JxI6x3+xXCwXjJopqGvp5KWqi/BtMxXRvarXN3SNFToq9UXcCITNVWJ5PSY1BktTj10hslQu0NwfSvSnkXdU6Sbcq9UVO3tMKdF9Grvidk4N8arc4ghnx99OlNVtmhSRiJLVOjRXIvsUV6br3J1A50GRx6x3nIrpHarBaq26V8jXOZTUkLpZHIibqqNair0TqTfxM8PdTgSLl+GPfd8LqtpGPY7wklEjuqI9U9NH5H/qd16u8nAj64+zfolX9C4CGL7aLrYbrPab3bqq23CnVEmpqqJY5I90RyczV6puiovwKZjGtPs6ya2rcsdw+/XeiSRY/PFHQSTR86bbt5moqbpunT3zeuM31y+YfG031WEw+nOuGpenuPLYMTv8AHQ25Z3TrE6hglXnciIq8z2KvsU6bgeH8TurHubZb80zfZH4ndWPc2y35pm+yXE4H9V871MqssZmd4ZcW25lItMjaSKHkWRZub/NtTffkb2+QgPMuJ7Wm3ZfebfSZXDHTU1fPDEz8GUy8rGyORqbrHuvRE7QIOyGx3nHbpJar/aq2118bWufTVcLopGoqboqtciL1Tqe+0YTmF3sFRkFqxe811opkes9dT0cj4I0Y3mfzPRNk5U6r5EPzP8xyHO8mnyTKK1tbc52MZJM2FkSKjGo1visRE7ETuLh8LvrIc4+Ju/1RAKOgH2oqWora2Cio4Xz1NRI2KGJibue9y7Naid6qqogGZxXC8vyuOokxjGLxemUytbO6ho5JkjV2+yOVqLtvsv7DD3Cjq7fXT0NfTTUtVTyOjmhmYrHxvRdla5q9UVF7lL6syWwcKWkWI2Crt6XC83epbNc2sk5XdeVZ5d9vGRiK1jU6b7J75FnHlp5Sx3C26tY21k1qvrWMrnw9WpMrUWOXdFVNnt6dOm7E73AVWMjj1jvORXSO1WC1Vt0r5GucympIXSyORE3VUa1FXonUxxOvAj64+zfolX9C4CGcgst3x+6y2m+2ystlwhRqy01XC6KRnMiOTdrkRU3RUX4FPATbxxeuXyX4qj+qxEJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJC4a/V9wf5ap/8aEemyaX5LHh2odhymakfVx2qujqnQMfyrIjF35UVUXbfygWS4mtQrvplxgU+T2pzntjtlKyrpuZUbUwLzc0a/xRe5URfeJodYNGp6+PidWZFhbbVqlRXt8Es6Jsj1Ztv54RUWPl39Nt05k3KUcRWpFNqrqM7LKW1S2uN1JFT+AklSRUVm/XmRE7d/IaW3IL63HXY428V6WZ8yTuoEqHeAdInY9Wb8u/v7AWx4T8/umpfFrkGVXRVYk9iqGUsG+6U8CTwckafAi7r5VVV7yvvEp6vucfLVR/jU9vDVqjTaR5/U5PVWea6smt0lGkEUyRKiukjdzbqi/mdnvmqaoZLHmOod+ymGkfSR3WukqmwPfzLGj135VVETfbygfLTzFbnm+a2rFbQxVq7jUNha7l3SNq+mkd/Za3dy+8hfrWfDcRfpTbdHrdqdjeEUlGyFKqOskhWeojam7eZrpGKnM7x1d3r7yqVE4ZtVse0jv1xv8AccWqL3cp4Up6WRlUkSU7FXd+yK1d1ds3r5E99SP9QspuWbZrdsquzt6u5VLpnN33SNvY1ie81qI1PeRALj8O2A4lpFmz71T8QGH3KgqoHQVlAk0EXhuiqxebzw7ZWu69i9FcnfuRbx4aYtxXPo83tMCNs+RPV03JtyxVaJu/sToj08dO3dUeVsLD1/EVbsh4fY9MMwxaqulZDSJBDdGVaNVj41/qJOVWqquaiNRevjdfKoFeCyfCBorUX24Q6m5VUy2bGbPJ55p5nSeBWpfGu6u5um0bduru/s7lIDw+psNHklHVZPbqu5WmGTnqKSmnSF86J2M51ReVFXbdUTfbfbZeqTVr5xI1Wf4bQ4Zi1hdi1hiajaqFk6PdM1qIjI05WtRsaJ2p39O5OoWMfn2mXEzbci0z88VVBLBN4S3TSPRjqnkTxZ4070Ryr4i9yoq9uyUo1l0yyTSzLpLBkEHMx276OtjRfA1cW/pmr5U7Fb2ov6lXVrDdrlYrzR3mz1ktFcKKZs1PPEuzo3tXdFT/ALL0UsjnfE1jGpGmseL6gaey1lekSL5/o61sSw1CJsk0SOYqt99qqqLuqLugFYS8XGF6zzBfjrZ9SlKOr29CetadfaHUDRewafU+N1NBLapKVzqt9U17ZPAwOiXZqNTbfm37emwEClxdF/8Ay/8AOvja3/DEU6JrwfW2ix3h2v8ApVJYKionurp3Nrm1CNZH4RGIm7OXdduTy94Es8LObWPVjT2r0J1GkWaRIFW01DpNpHxsTdGtVd/6yP0zfK1Oxdl3+XFJldh0k00o9B9PpVZLLCj7zUo5FkVjk8Zr1TZPCSdFVO5uybIioVIttdW2y4QXC3Vc9JV070khnherHxuTsVFTqin93e5XC73Ooud1rqmurql6vnqKiVZJJHeVzl6qoFyuIb1huA/E2n6s4pUTnqRrtQ5bw+49pfFjtRSz2iOja6tdUtc2XwESsXZnKipvvv2kGAXb8zS/0ezX9LpP8EhSuv8Ay6o+Nd/Em/hd15odG7bfKSrxyovC3SaGRroqpsXg+Rrk2Xdq7783/Qg2ok8LPJKibc7ldt5N1AkHh5t2pVTqLTXLSyhWqvttasy7ujSNsbvEdz+EVG8qo7Zeu/Xp1Jku3GHqxY7tWWW6YxiTa+gqJKapb4KZeWVjla5N2zbLsqKnQh7h41Wq9Is6fkUFsbdKeopXUtTSrMsSvYrmu3R2y7KitTtRU7fhSYK3iK0YrayetreHyz1NVUSOlmmmSne+R7l3c5zli3VVVVVVXtA/bTxoajVd1pKWTG8URk07I3K2Go3RFciLt/W++erzSOx26iy7FL3TU0UVXcaWojqnsZssngnR8quXvXaRU/UeCPiD0SikbJHw72Nj2KjmuaymRUVOxUXwJGPEnrJV6x5RQ3F1pbaaG3QOhpafw3hXLzO3c9ztkTddmpsidNgIpOiOtOouR6Y8MWFZDi7qRtdLHbqRy1EPhG+DdSOcvTdOu7E6nO4tpFxV4RWYLZsUybSlt+pbbTQRIysqYpI3SRR8iSIx0aoi7b/BuoGh3riv1Zu9nrbVWTWR1NW08lPMjaDZVY9qtdsvN0XZVIHLReiA0P8A93Sxf8um+5NZ1R1i0pybA7nY8d0VtGO3SqbGlPcoWQI+BWyNcqpyxovVrVb0VO0CAwAAP6je+KRskb3MexUc1zV2VFTsVFP5AHRLBNR8qn4J5c9mrWSZBSW2qSOqfHvu6KZ8THuReiu2ai+RV7jnpX1dVX1s9dW1EtTVVEjpZppXK58j3LurlVeqqqrvuTpjevtBaeGip0hfjdTLUTU1TD+EEqmoxFlmdIi8nLv05tu0gQAXj1B/8uW3fJ9v+txlHCymmXE1abNpRR6e5tp9T5Pb6JqRxI+dqRyxtdzMSSN7HIqtXbZfeReioBWsmDgy9cvh/wAbU/VZiQvRAaH/AO7pYv8Al033J7bHxLaR2O6wXWy6C22219OqrDU0roIpY1VFRdnNiRU3RVRfeVUA1PzQD1wc3yVTf/IgvHP9Ibb+lxf40Nn1u1DrtUNQ63La6jjofDMZFDTMfzpFGxNmpzbJuvaqrsnaabTzSU9RHUQu5ZIno9i+RUXdFAuf5pj+Q4H8bX/wpylhbW58WOG5Va7fHn2jlvvtZSNVEdNNHLG1zkTncxskaqzm5U6br2J1XYxnogND/wDd0sX/AC6b7kCQdC/WA5X8n3f/AAPKOFmNQeJ2zV+ldzwHBdOqbFqO5RPhlWOdqRxseqeE5Y2Mam7k3RV379+pWcC1HmbfqnZL8ip9NGZ/Pda9HbZq3fLFkehljq3U14npq67Ojglllc2RWvmViw7uVV3cqc2/vqQnwxau0mj2U3S9Vdknu7a6h86pFFOkSsXna7m3VF39Ltt75oeo2QMyvP7/AJPFTOpWXW4z1jYHP5ljSR6u5VXZN9t9twOhl5Zg+J4RS6n6T6U45kr2NWWOS0wxU88cStcjnsVsblcqdUc1Nl7fgKIa7amXLVjPZMquNDBb0SnZTU9LE9XpFE1XKiK5UTmXdzlVdk7exDY+HLXa/wCkVzlhSF91x6qVXVFudLycr9ukkbtl5Xdm/TZU7e5UxevWbYPn+QLkWM4fVY1cqh6urmJVMkgqFXdVk5UanK9V23VOi9V236qEaAACdeBH1x9m/RKv6FxNHEdrBptier13sWQaJ2PKLlTsgWa51LoUkm5oWOai80Ll8Vqo3t7isPD/AKg0+mGptFmFTbJblHTQzRrTxypGrudit35lRdtt9+w+WvWeQal6o3TMqe2yW2OubC1KeSVJHM8HCyP0yIm+/Lv2d4Ez27iQ0ot1fBX2/h1x+lq6eRJIZoZoGPjei7o5qpT7oqKRrxIa03HWW/W6rns8NooLZFJHSUzZfCv3erVe5z9m7qvI3oiIibEUADO6ef6f478q0v0rS1PmmP5dgfxVf/GnKhWysnt1ypbhSuRs9LMyaJVTdEc1yOT/AKoWsvHFbg2VUdA7OdGqG+11LGrUfUTRSsYq7cyxo+NVajtk3T3k7dkAqUXG8zO/Ls8+KoP41BrfogND/wDd0sX/AC6b7kydn4rcGxWjr3YNo1Q2Kuqo0ar6eaKJj1TflWRGRorkbuuye+vZuoFZ9Q/9P8i+Var6Vxgj0XKsnuFxqa+pcjp6mZ80qp3ucqqv/VTzgXj0+/8ALluPyfcPrchRwnvG9faC08NFTpC/G6mWompqmH8IJVNRiLLM6RF5OXfpzbdpAgA6A4dlt3wXgJtuV2FYG3GgoWrAs0fOzd1byLunf0cpz+LP6b8TeLY9o7a9Och06dkFHSQLFUJPUxrDP/WrIm8bmKnRVTt36puBg/Rgaxf+vYvm/wD/ALEBVlQ+rrJqqVGpJNI6R3KnTdV3XYs56IDQ/wD3dLF/y6b7kxuU65aN3PGbrbbdoHZbdW1dFNBT1bI6fmp5HsVrZE2iRd2qqL0VOwCt5dXJv/LYoviaf/8AkUKVE53XXahreGGDR1uO1DKmKONv4QWparF5alJvScu/Ym3aB6+GXiCqcB2xDMWSXbCareN8TmeEfRc3a5iL6aPt5mfrTr0dY7TfQmw2HXG0aqac3WhnxKrpp3PpGSq5IVliVGrC5N0cxVX0qqit7t06JzzJi4dNesh0krn0qxPu+Ozqrprc6XlVj19nG7ZeVd+1Ntl69/UD+eM31y+YfG031WEh83TW/NYdRNUr1mVPQSW+K5Oic2nfIj3M5IWR9XIib+k37O80sC43mZ35dnnxVB/GoKrah/6f5F8q1X0riTuFvW2j0anyCWrx+ovH4WbTtakVSkXg/BLJvvu1d9/CJ+wiTJbgy7ZHc7qyN0TKyrlqGscu6tR71dsvwbgY8vFwu+shzj4m7/VEKOk9aUa+0OE6EX7TWbG6mtnusda1tY2qaxsfh4fBpu3lVV2237eoEClm+AvTWG+5hV6iX2ONtmx1F87unREjfUq1V5lVem0bfGXyKrF7ishPlx1/oKPh4ZpPiGMVFodLC2GtuD6tHrMjl3nXlRvRZF6duyNVU8gEta76Z4lqtqBUZPXcQmG0cHg2wUdH4SB6U8TfY83nhOZVVVVV27/IiEnaZ4jit10Tq9HLhqRYc3TzvIyGShmi8LTweL4PxEkkX+rfsqO7E8VNunXm2bZpDm9fp1qJaMut6OkdRTf10KO2SeF3iyRr8LVXZe5dl7gMbnONXPDsvumL3iLwddbah0Evkdt2OT+y5NnJ7yoS3wI+uPs36JV/QuMLxMapY9q1klBkVsxeosdxigWnq3vqUlSoYi7sXo1NnN3cm/eip5EMHw/6g0+mGptFmFTbJblHTQzRrTxypGrudit35lRdtt9+wDbuOL1y+S/FUf1WIhItjkHE1pNkF1lu190Ht1zuEyNSWpq3QSyP5URqbudEqrsiInwIeD0QGh/+7pYv+XTfcgVdBterWRWHK88r75jWNU+NWuobEkNtgRqMhVsbWuVOVqJ4zkV3Z3mqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z";

export default function Report() {
  const { playerKey: pk } = useParams();
  const { profile, course } = useAuth();
  const navigate = useNavigate();
  const [evaluators, setEvaluators] = useState({});
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [overall, setOverall] = useState('');
  const [overallDirty, setOverallDirty] = useState(false);
  const overallRef = useRef(null);
  const [saveTimer, setSaveTimer] = useState(null);
  const [globalImage, setGlobalImage] = useState(null);
  const [uploadingGlobal, setUploadingGlobal] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [uploadingImg, setUploadingImg] = useState(false);

  const p = DEFAULT_ROSTER.find(r => playerKey(r) === pk) || {};
  const ini = (p.first?.[0] || '') + (p.last?.[0] || '');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await get(ref(db, sessionKey(course) + '/players/' + pk));
        if (snap.exists()) {
          const data = snap.val();
          const rawEvs = data.evaluators || {};
          const evs = {};
          Object.keys(rawEvs).forEach(en => {
            const dec = decodeEval(en);
            if (!evs[dec]) evs[dec] = JSON.parse(JSON.stringify(rawEvs[en]));
            else {
              const ex = evs[dec]; const inc = rawEvs[en];
              evs[dec] = { scores: Object.assign({}, inc.scores || {}, ex.scores || {}), comments: Object.assign({}, inc.comments || {}, ex.comments || {}), overallComment: ex.overallComment || inc.overallComment || '' };
            }
          });
          if (profile?.name && rawEvs[profile.name]) {
            const live = rawEvs[profile.name];
            evs[profile.name] = { ...live };
          }
          setEvaluators(evs);
          setPhoto(data.photo || null);
          setGallery(data.gallery || []);
          try {
            const gSnap = await get(ref(db, sessionKey(course) + '/globalImage'));
            if (gSnap.exists()) setGlobalImage(gSnap.val());
          } catch(e) {}
          const loadedOverall = evs[profile?.name]?.overallComment || '';
          setOverall(loadedOverall);
          setOverallDirty(false);
          if (overallRef.current) overallRef.current.innerText = loadedOverall;
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [pk, profile]);

  function handleOverall(val) {
    setOverall(val);
    setOverallDirty(true);
  }
  // Uncontrolled contentEditable: React no longer re-renders {overall} into the div
  // on every keystroke, which was resetting the cursor position and reversing typed text.

  async function saveOverall() {
    const myD = evaluators[profile?.name] || {};
    const newD = { ...myD, overallComment: overall };
    setEvaluators(prev => ({ ...prev, [profile.name]: newD }));
    await set(ref(db, sessionKey(course) + '/players/' + pk + '/evaluators/' + encodeEval(profile.name) + '/overallComment'), overall);
    setOverallDirty(false);
    window.showToast?.('Comment saved!');
  }

  const ens = Object.keys(evaluators);

  function avg(key) {
    const vs = ens.map(n => parseFloat((evaluators[n]?.scores || {})[key])).filter(v => !isNaN(v) && v > 0);
    return vs.length ? (vs.reduce((a, b) => a + b, 0) / vs.length).toFixed(1) : null;
  }

  let allVals = [];
  SECTIONS.filter(s => s.id !== 'fitness').forEach(sec => sec.metrics.forEach(m => { const a = avg(sec.id + '_' + m); if (a) allVals.push(parseFloat(a)); }));
  const overallAvg = allVals.length ? (allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(1) : null;

  let workOns = [];
  SECTIONS.filter(s => s.id !== 'fitness').forEach(sec => sec.metrics.forEach(m => {
    const a = parseFloat(avg(sec.id + '_' + m));
    if (!isNaN(a) && a > 0 && a < 3) workOns.push({ m, sec: sec.label, a });
  }));
  workOns.sort((a, b) => a.a - b.a);

  async function handleGlobalImageUpload(file) {
    if (!file) return;
    setUploadingGlobal(true);
    const reader = new FileReader();
    reader.onload = async e => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const max = 1600;
        let w = img.width, h = img.height;
        if (w > max) { h = h * max / w; w = max; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.88);
        setGlobalImage(compressed);
        await set(ref(db, sessionKey(course) + '/globalImage'), compressed);
        setUploadingGlobal(false);
        window.showToast?.('Camp image saved to all reports!');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function removeGlobalImage() {
    setGlobalImage(null);
    await set(ref(db, sessionKey(course) + '/globalImage'), null);
    window.showToast?.('Camp image removed');
  }

  async function handleGalleryUpload(files) {
    if (!files || !files.length) return;
    setUploadingImg(true);
    const newImgs = [...gallery];
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      await new Promise(resolve => {
        reader.onload = async e => {
          const img = new Image();
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            const max = 1200;
            let w = img.width, h = img.height;
            if (w > max) { h = h * max / w; w = max; }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            newImgs.push(canvas.toDataURL('image/jpeg', 0.85));
            resolve();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
    setGallery(newImgs);
    await set(ref(db, sessionKey(course) + '/players/' + pk + '/gallery'), newImgs);
    setUploadingImg(false);
    window.showToast?.('Images saved!');
  }

  async function removeGalleryImage(idx) {
    const newImgs = gallery.filter((_, i) => i !== idx);
    setGallery(newImgs);
    await set(ref(db, sessionKey(course) + '/players/' + pk + '/gallery'), newImgs);
    window.showToast?.('Image removed');
  }

  async function downloadPDF() {
    setGeneratingPDF(true);
    window.showToast?.('Generating PDF...');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const rpt = document.getElementById('report-content');

      // Hide all buttons and admin controls from PDF
      const hiddenEls = rpt.querySelectorAll('button, label, input, #report-actions');
      hiddenEls.forEach(el => { el.dataset.pdfHide = el.style.display; el.style.display = 'none'; });

      // Set fixed wide layout for capture
      const origStyle = rpt.getAttribute('style') || '';
      rpt.style.cssText = 'background:#000;width:1000px;max-width:none;padding:32px;box-sizing:border-box;';

      // Wait for images to load
      const images = rpt.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; setTimeout(resolve, 3000); });
      }));

      await new Promise(r => setTimeout(r, 600));

      // Measure each top-level card's vertical position BEFORE screenshotting,
      // so we know exactly where safe page-break points are.
      const rptTop = rpt.getBoundingClientRect().top;
      // Collect boundaries from top-level cards AND from likely-deep break points
      // (anything with a top margin/border that visually reads as its own block:
      // comment boxes, individual metric rows, gallery items, etc).
      // Select every descendant at any nesting depth, so comment boxes nested
      // arbitrarily deep inside a section card are always seen as break candidates.
      const breakSelector = '#report-content *';
      const candidateEls = Array.from(rpt.querySelectorAll(breakSelector));
      const cardBoundaries = candidateEls.map(el => {
        const r = el.getBoundingClientRect();
        return { top: r.top - rptTop, bottom: r.bottom - rptTop, height: r.height };
      }).filter(b => b.height > 30 && b.height < 1200) // ignore tiny bars/labels and huge wrapper artifacts
        .sort((a, b) => a.top - b.top);

      const canvas = await html2canvas(rpt, {
        scale: 2,
        backgroundColor: '#000000',
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 1000,
        windowWidth: 1000,
      });

      // Restore everything
      rpt.setAttribute('style', origStyle);
      hiddenEls.forEach(el => { el.style.display = el.dataset.pdfHide !== undefined ? el.dataset.pdfHide : ''; delete el.dataset.pdfHide; });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const a4W = 210, a4H = 297;
      const totalHmm = (canvas.height * a4W) / canvas.width;
      const cssToPx = canvas.width / 1000; // capture width was forced to 1000 css px
      const pxPerMm = canvas.width / a4W;
      const bottomMarginMm = 4; // breathing room at the bottom of each page
      const pageHpx = (a4H - bottomMarginMm) * pxPerMm;

      // Convert card boundaries (css px) into canvas px
      const boundariesPx = cardBoundaries.map(b => ({
        top: b.top * cssToPx,
        bottom: b.bottom * cssToPx,
      }));

      // Build cut points using a safe approach: starting from the ideal page-height
      // cut point, search backward for the latest position that does NOT fall inside
      // any candidate element's vertical range (i.e. a true gap between elements).
      function isInsideAnyElement(y) {
        for (let i = 0; i < boundariesPx.length; i++) {
          const b = boundariesPx[i];
          if (y > b.top + 1 && y < b.bottom - 1) return true;
        }
        return false;
      }

      const cuts = [0];
      let pageStart = 0;
      while (pageStart + pageHpx < canvas.height) {
        let idealCut = pageStart + pageHpx;
        let safeCut = idealCut;
        // search backward up to 40% of a page height for a safe gap
        const maxSearch = pageHpx * 0.6;
        let found = false;
        for (let y = idealCut; y > idealCut - maxSearch && y > pageStart; y -= 2) {
          if (!isInsideAnyElement(y)) { safeCut = y; found = true; break; }
        }
        if (!found) {
          // No safe gap found - find the element that contains idealCut and
          // push the cut to ITS top edge instead, so we never slice through it.
          let containingTop = null;
          for (let i = 0; i < boundariesPx.length; i++) {
            const b = boundariesPx[i];
            if (idealCut > b.top + 1 && idealCut < b.bottom - 1) {
              if (containingTop === null || b.top > containingTop) containingTop = b.top;
            }
          }
          safeCut = (containingTop !== null && containingTop > pageStart) ? containingTop : idealCut;
        }
        // Safety net: never let a cut land at/before the current page start —
        // that would produce a near-zero-height page and duplicate content.
        if (safeCut <= pageStart + 5) safeCut = idealCut;
        cuts.push(safeCut);
        pageStart = safeCut;
      }
      cuts.push(canvas.height);

      for (let i = 0; i < cuts.length - 1; i++) {
        const sliceTopPx = Math.round(cuts[i]);
        const sliceBottomPx = Math.round(cuts[i + 1]);
        const sliceHeightPx = sliceBottomPx - sliceTopPx;
        const sliceHmm = (sliceHeightPx * a4W) / canvas.width;

        // Crop just this page's slice into its own canvas, so there is no
        // image data at all below it - nothing to clip, nothing to leak through.
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;
        const sctx = sliceCanvas.getContext('2d');
        sctx.fillStyle = '#000000';
        sctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sctx.drawImage(canvas, 0, sliceTopPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
        const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.92);

        if (i > 0) pdf.addPage();
        pdf.setFillColor(0, 0, 0);
        pdf.rect(0, 0, a4W, a4H, 'F');
        pdf.rect(0, 0, a4W, a4H, 'S');
        pdf.addImage(sliceImgData, 'JPEG', 0, 0, a4W, sliceHmm, '', 'FAST');
      }
      pdf.save(`${p.first || 'player'}_${p.last || ''}_report.pdf`.replace(/\s+/g, '_'));
      window.showToast?.('PDF Downloaded!');
    } catch (e) { window.showToast?.('PDF failed — ' + e.message); console.error(e); }
    setGeneratingPDF(false);
  }

  if (loading) return <div className="loading"><div className="spinner"></div><div>Loading report...</div></div>;

  return (
    <div id="report-content" style={{ background: '#000' }}>
      {/* Logo header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 20, borderBottom: '2px solid var(--green)' }}>
        <img src={logo} alt="IRANZ" style={{ height: 88, width: 'auto' }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green)' }}>{course || ""}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Player Evaluation Report</div>
        </div>
      </div>

      {/* Actions */}
      <div id="report-actions" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px 14px' }} onClick={() => navigate('/')}>← Players</button>
        <button className="btn btn-primary" style={{ fontSize: 12, padding: '8px 14px' }} onClick={downloadPDF} disabled={generatingPDF}>
          {generatingPDF ? 'Generating...' : '⬇ Download PDF'}
        </button>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #000 0%, #0f1f2e 100%)', border: '1.5px solid #222', borderRadius: 16, padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 80, height: 80, borderRadius: 12, border: '3px solid var(--green)', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: 'var(--green)', flexShrink: 0 }}>
          {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ini}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>{p.first} {p.last}</div>
          <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{p.primaryPos || ''} {p.secondaryPos ? '· ' + p.secondaryPos : ''}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{[p.weight ? p.weight + 'kg' : '', p.height ? p.height + 'cm' : '', p.club].filter(Boolean).join(' · ')}</div>
        </div>
        {overallAvg && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 56, fontWeight: 900, lineHeight: 1, color: scoreColor(overallAvg) }}>{overallAvg}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>/5 Overall</div>
          </div>
        )}
      </div>

      {/* Evaluator tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {ens.map((n, i) => <span key={n} style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${getEvalColor(n, i)}`, color: getEvalColor(n, i), fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>◎ {n}</span>)}
      </div>

      {/* Work-ons */}
      {workOns.length > 0 && (
        <div style={{ background: '#0a1a0a', border: '1.5px solid #166534', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--amber)', marginBottom: 12 }}>⚠ Areas to Work On</div>
          {workOns.slice(0, 6).map(w => (
            <div key={w.m} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid #1a2a1a' }}>
              <span style={{ background: '#78350f', color: '#f59e0b', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 900, padding: '4px 8px', borderRadius: 6 }}>{w.a}</span>
              <div><div style={{ fontSize: 14, fontWeight: 600 }}>{w.m}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{w.sec}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      {SECTIONS.map(sec => {
        const hasScore = sec.metrics.some(m => ens.some(n => { const v = (evaluators[n]?.scores || {})[sec.id + '_' + m]; return v != null && parseInt(v) > 0; }));
        const hasComment = ens.some(n => { const c = (evaluators[n]?.comments || {})[sec.id]; return c && c.trim().length > 0; });
        if (!hasScore && !hasComment) return null;
        let secVals = [];
        sec.metrics.forEach(m => { const a = avg(sec.id + '_' + m); if (a) secVals.push(parseFloat(a)); });
        const secAvg = secVals.length ? (secVals.reduce((a, b) => a + b, 0) / secVals.length).toFixed(1) : null;
        return (
          <div key={sec.id} style={{ background: '#000', border: '1.5px solid #222', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{sec.label}</span>
              {secAvg && <span style={{ fontSize: 20, color: scoreColor(secAvg) }}>{secAvg}</span>}
            </div>
            {sec.metrics.map(m => {
              const key = sec.id + '_' + m;
              const hasAny = ens.some(n => { const v = (evaluators[n]?.scores || {})[key]; return v != null && parseInt(v) > 0; });
              if (!hasAny) return null;
              const a = avg(key);
              return (
                <div key={m} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #222' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{m}</div>
                  {ens.map((n, i) => {
                    const v = (evaluators[n]?.scores || {})[key];
                    if (!v || parseInt(v) === 0) return null;
                    const c = getEvalColor(n, i);
                    return (
                      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', width: 100, flexShrink: 0, color: c }}>{n}</div>
                        <div style={{ flex: 1, height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 3, width: parseInt(v) / 5 * 100 + '%', background: c }} />
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", width: 24, textAlign: 'right', color: c }}>{v}</div>
                      </div>
                    );
                  })}
                  {a && ens.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <div style={{ fontSize: 10, width: 100, flexShrink: 0, color: 'var(--muted)' }}>AVG</div>
                      <div style={{ flex: 1, height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 3, width: parseFloat(a) / 5 * 100 + '%', background: 'var(--amber)' }} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", width: 24, textAlign: 'right', color: 'var(--amber)' }}>{a}</div>
                    </div>
                  )}
                </div>
              );
            })}
            {ens.map((n, i) => {
              const c = (evaluators[n]?.comments || {})[sec.id];
              if (!c?.trim()) return null;
              return (
                <div key={n} style={{ background: '#0a1628', borderLeft: '3px solid var(--green)', borderRadius: '0 8px 8px 0', padding: '12px 14px', marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, color: getEvalColor(n, i) }}>◎ {n}</div>
                  <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{c}</div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Overall comment */}
      <div style={{ background: 'linear-gradient(135deg, #0a1a0a, #0f2a0f)', border: '1.5px solid #166534', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>🏉</span>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--green)' }}>IRANZ Overall Comment</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Maximise Your Potential</div>
          </div>
        </div>
        {ens.map((n, i) => {
          const oc = evaluators[n]?.overallComment;
          if (!oc?.trim()) return null;
          return (
            <div key={n} style={{ background: '#0a1628', borderLeft: '3px solid var(--green)', borderRadius: '0 8px 8px 0', padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, color: getEvalColor(n, i) }}>◎ {n}</div>
              <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{oc}</div>
            </div>
          );
        })}
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Additional Coaching Notes</div>
        <div contentEditable suppressContentEditableWarning
          dir="ltr"
          ref={overallRef}
          onInput={e => handleOverall(e.currentTarget.innerText)}
          onPaste={e => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
          }}
          style={{ minHeight: 80, height: 'auto', overflow: 'visible', background: '#0a1a0a', border: '1.5px solid #166534', borderRadius: 8, padding: '12px 14px', fontSize: 15, lineHeight: 1.7, color: 'var(--white)', outline: 'none', whiteSpace: 'pre-wrap', wordWrap: 'break-word', unicodeBidi: 'plaintext', textAlign: 'left' }}>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 10, fontSize: 12, padding: '8px 16px', opacity: overallDirty ? 1 : 0.5 }}
          onClick={saveOverall}
          disabled={!overallDirty}
        >
          {overallDirty ? 'Save Comment' : 'Saved'}
        </button>
      </div>
      {/* Per-player image gallery */}
      {(gallery.length > 0 || profile?.role === 'admin') && (
        <div style={{ background: '#000', border: '1.5px solid #222', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📸 Game & Training Images</span>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'inherit' }}>{gallery.length} image{gallery.length !== 1 ? 's' : ''}</span>
          </div>
          {profile?.role === 'admin' && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green)', color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', marginBottom: 16 }}>
              {uploadingImg ? 'Uploading...' : '📎 Add Images'}
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleGalleryUpload(e.target.files)} disabled={uploadingImg} />
            </label>
          )}
          {gallery.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>No images added yet.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {gallery.map((img, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #222', background: '#0a0a0a' }}>
                <img src={img} alt="" style={{ width: '50%', height: 'auto', display: 'block', cursor: 'pointer', margin: '0 auto' }} onClick={() => window.open(img, '_blank')} />
                {profile?.role === 'admin' && (
                  <button onClick={() => removeGalleryImage(i)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, fontSize: 14, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global camp image */}
      {(globalImage || profile?.role === 'admin') && (
        <div style={{ background: '#000', border: '1.5px solid #222', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span>🏕 Camp Photo</span>
            {profile?.role === 'admin' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--green)', color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '7px 14px', borderRadius: 8, cursor: 'pointer' }}>
                  {uploadingGlobal ? 'Uploading...' : globalImage ? '🔄 Replace' : '📎 Upload Camp Photo'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleGlobalImageUpload(e.target.files[0])} disabled={uploadingGlobal} />
                </label>
                {globalImage && (
                  <button onClick={removeGlobalImage} style={{ background: 'transparent', border: '1.5px solid #333', color: 'var(--muted)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '7px 14px', borderRadius: 8, cursor: 'pointer' }}>✕ Remove</button>
                )}
              </div>
            )}
          </div>
          {!globalImage && <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>Upload one camp photo — it appears on every player and coach report.</div>}
          {globalImage && <img src={globalImage} alt="Camp" style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 400, objectFit: 'cover' }} />}
        </div>
      )}
    </div>
  );
}
