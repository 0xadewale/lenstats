import {CURRENCIES} from '../../constants'
import useLensUser from '../../util/useLensUser'
import {useQuery} from '@tanstack/react-query'
import getPublications from '../../graphql/query/getPublications'
import getFollowers from "../../graphql/query/getFollowers";
import {SetStateAction, useEffect, useState} from "react";
import {getStats} from "../../graphql/query/getStats";
import Profile from "../../types/Profile";
import FollowerProfile from "../../types/FollowerProfile";
import {MediaRenderer, useAddress} from "@thirdweb-dev/react";
import ModuleSelector from "./ModuleSelector";
import BestModule from "./Form/BestModule";

export default function Giveaway() {
    const [bestCollector, setBestCollector] = useState<{ profile: Profile } | null>()
    const [bestCommentator, setBestCommentator] = useState<{ profile: Profile } | null>()
    const [randomFollowers, setRandomFollowers] = useState<FollowerProfile[] | null>(null)
    const [selected, setSelected] = useState<{ id: number, name: string } | null>();
    const [winnerCount, setWinnerCount] = useState(0);
    const {profile, isSignedIn} = useLensUser()
    const address = useAddress();

    const {data: publications} = useQuery(
        ["publications"],
        () => getPublications(profile?.id as string),
        {
            // Only run this query if the profile is loaded
            enabled: !!profile,
        }
    )

    const {data: followers} = useQuery(
        ["followers"],
        () => getFollowers(profile?.id as string),
        {
            // Only run this query if the profile is loaded
            enabled: !!profile,
        }
    )

    useEffect(() => {
        if (publications) {
            getStats(publications).then((response) => {
                if (response) {
                    setBestCollector(response.bestCollector)
                    setBestCommentator(response.bestCommentator)
                }
            })
        }
    }, [publications])

    function handleSelected(item: any) {
        setSelected(item)
    }

    function handleWinnerCountChange(e: any) {
        setWinnerCount(e.target.value)
    }

    function draw() {
        if (selected && followers && selected.id) {
            if (selected.id === 4) {
                const items: SetStateAction<FollowerProfile[] | null> = []
                while (items.length < winnerCount) {
                    const random = Math.floor(Math.random() * followers.length)
                    if (!items.includes(followers[random])) {
                        items.push(followers[random])
                    }
                }
                setRandomFollowers(items)
            }
        }
    }

    if (!address || !isSignedIn) {
        return (
            <div>You need to login first</div>
        )
    }

    if (!profile) {
        return <p>No Lens profile.</p>;
    }


    return (
        <div className="hero h-[80vh] bg-base-200">
            <div className="hero-content flex-col w-full lg:flex-row justify-between">
                <div>
                    <h1 className="text-5xl font-bold">Community Giveaway!</h1>
                    <p className="py-6">Select a giveaway module to reward your community</p>
                    {
                        bestCollector && bestCommentator ? (
                            <>
                                <ModuleSelector onSelect={handleSelected} selected={selected} />
                            </>
                        ) : (
                            <progress className="progress w-56"></progress>
                        )
                    }
                    {
                        (selected?.id === 3 || selected?.id === 4 || selected?.id === 5 || selected?.id === 6) && (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>Number of winners</div>
                                </div>
                                <input type='number' className="input w-full" onChange={handleWinnerCountChange} />
                                <div className="flex mt-4">
                                    <button
                                        className={`w-full btn btn-success`}
                                        onClick={() => {
                                            draw()
                                        }}
                                    >Draw</button>
                                </div>
                            </>
                        )
                    }
                </div>
                <div className="flex flex-col gap-4">
                    {
                        selected?.id === 1 && bestCollector && (
                            <div className="py-4 px-2 rounded-xl bg-base-300">
                                <div className="flex flex-col items-center">
                                    {
                                        bestCollector.profile.picture && bestCollector.profile.picture.original ? (
                                            <MediaRenderer
                                                src={bestCollector.profile.picture.original.url}
                                                alt="user profile picture"
                                                className="rounded-full object-cover w-12 h-12"
                                            />
                                        ) : (
                                            <div className="bg-base-300 w-12 h-12 rounded-full"></div>
                                        )
                                    }
                                </div>
                                <div className="font-semibold text-center">{ bestCollector.profile.name }</div>
                            </div>
                        )
                    }
                    {
                        selected?.id === 2 && bestCommentator && (
                            <div className="py-4 px-2 rounded-xl bg-base-300">
                                <div className="flex flex-col items-center">
                                    {
                                        bestCommentator.profile.picture && bestCommentator.profile.picture.original ? (
                                            <MediaRenderer
                                                src={bestCommentator.profile.picture.original.url}
                                                alt="user profile picture"
                                                className="rounded-full object-cover w-12 h-12"
                                            />
                                        ) : (
                                            <div className="bg-base-300 w-12 h-12 rounded-full"></div>
                                        )
                                    }
                                </div>
                                <div className="font-semibold text-center">{ bestCommentator.profile.name }</div>
                            </div>
                        )
                    }
                    {
                        selected?.id === 4 && randomFollowers && (
                            <div className="py-4 px-2 rounded-xl bg-base-300">
                                <div className="flex flex-col items-start gap-4 max-h-64 overflow-y-auto">
                                    {
                                        randomFollowers.map((follower, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                {
                                                    follower.wallet.defaultProfile.picture && follower.wallet.defaultProfile.picture.original ? (
                                                        <MediaRenderer
                                                            src={follower.wallet.defaultProfile.picture.original.url}
                                                            alt="user profile picture"
                                                            className="rounded-full object-cover w-12 h-12"
                                                        />
                                                    ) : (
                                                        <div className="bg-base-300 w-12 h-12 rounded-full"></div>
                                                    )
                                                }
                                                <div className="font-semibold text-center">
                                                    { follower.wallet.defaultProfile.name || follower.wallet.defaultProfile.handle  }</div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                    {(() => {
                        if (selected) {
                            switch (selected.id) {
                                case 1:
                                    if (bestCollector) {
                                        return <BestModule
                                            label={selected.name}
                                            winner={bestCollector.profile}
                                            winners={null}
                                            address={address}
                                            currencies={CURRENCIES}
                                        />
                                    }
                                    break;
                                case 2:
                                    if (bestCommentator) {
                                        return <BestModule
                                            label={selected.name}
                                            winner={bestCommentator.profile}
                                            winners={null}
                                            address={address}
                                            currencies={CURRENCIES}
                                        />
                                    }
                                    break;
                                case 4:
                                    if (bestCommentator) {
                                        return <BestModule
                                            label={selected.name}
                                            winner={null}
                                            winners={randomFollowers}
                                            address={address}
                                            currencies={CURRENCIES}
                                        />
                                    }
                                    break;
                                default:
                                    return <div className="text-gray-500">Comming Soon</div>
                            }
                        }
                    })()}
                </div>
            </div>
        </div>
    )
}
